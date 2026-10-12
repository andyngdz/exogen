import os
from http import HTTPStatus
from pathlib import Path
from typing import Optional

import requests
from huggingface_hub import hf_hub_url
from requests.adapters import HTTPAdapter

from app.schemas.downloads import AuthHeaders
from app.services import logger_service

from .progress import DownloadProgress

logger = logger_service.get_logger(__name__, category='Download')


class FileDownloader:
	"""Handles low-level file download operations from HuggingFace Hub."""

	CHUNK_SIZE = 4 * 1024 * 1024

	def __init__(self, session: Optional[requests.Session] = None):
		self.session = session or self._build_session()

	def _build_session(self) -> requests.Session:
		session = requests.Session()
		adapter = HTTPAdapter(
			pool_connections=10,
			pool_maxsize=20,
			max_retries=3,
		)
		session.mount('https://', adapter)
		return session

	def auth_headers(self, token: Optional[str] = None) -> AuthHeaders:
		"""Build authorization headers for HuggingFace API requests."""
		if token:
			return AuthHeaders(authorization=f'Bearer {token}')

		return AuthHeaders()

	def download_file(
		self,
		repo_id: str,
		filename: str,
		revision: str,
		snapshot_dir: str,
		file_index: int,
		progress: DownloadProgress,
		file_size: Optional[int] = None,
		token: Optional[str] = None,
	) -> str:
		"""
		Download a single file from HuggingFace Hub with streaming and progress tracking.

		Args:
			repo_id: HuggingFace repository ID
			filename: Relative path of file within repository (validated for path traversal)
			revision: Git revision/commit hash
			snapshot_dir: Local directory to store downloaded files
			file_index: Zero-based index in progress.file_sizes list (must align with file order)
			progress: Progress tracker for websocket updates
			file_size: Expected size for the file (used to seed progress totals)
			token: Optional HuggingFace authentication token

		Returns:
			str: Absolute path to the downloaded file

		Side Effects:
			- Creates snapshot_dir and parent directories if needed
			- Skips download if file already exists with matching size
			- Downloads to temporary .part file, then atomically renames on success
			- Updates progress.set_file_size() with actual Content-Length
			- Calls progress.update_bytes() for each downloaded chunk
			- Cleans up .part file on error
		"""
		snapshot_path = Path(snapshot_dir)
		local_path = snapshot_path / filename

		os.makedirs(snapshot_path, exist_ok=True)
		os.makedirs(local_path.parent, exist_ok=True)

		local_path_str = str(local_path)

		if os.path.exists(local_path_str):
			actual_size = os.path.getsize(local_path_str)
			if actual_size > 0:
				progress.set_file_size(file_index, actual_size)
				logger.debug('Skipping download for %s; already complete', filename)
				return local_path_str
			os.remove(local_path_str)

		temp_path = f'{local_path_str}.part'
		resume_size = 0
		write_mode = 'wb'

		if os.path.exists(temp_path):
			resume_size = os.path.getsize(temp_path)

		url = hf_hub_url(repo_id=repo_id, filename=filename, revision=revision)
		headers = self.auth_headers(token).as_dict()

		if resume_size > 0:
			headers['Range'] = f'bytes={resume_size}-'

		with self.session.get(url, stream=True, headers=headers, timeout=60) as response:
			response.raise_for_status()

			# Handle Resuming
			if response.status_code == HTTPStatus.PARTIAL_CONTENT:
				write_mode = 'ab'
				progress.register_existing_bytes(resume_size)
				logger.info('Resuming %s from %s bytes', filename, resume_size)
			elif resume_size > 0:
				# Server ignored range or file changed, restart download
				resume_size = 0
				logger.info('Server ignored range for %s, restarting download', filename)

			target_size = file_size
			content_length = response.headers.get('Content-Length')
			if content_length:
				try:
					length = int(content_length)
					target_size = length + resume_size
				except (TypeError, ValueError):
					target_size = file_size
			if target_size and target_size > 0:
				progress.set_file_size(file_index, target_size)

			with open(temp_path, write_mode) as dest:
				for chunk in response.iter_content(chunk_size=self.CHUNK_SIZE):
					if not chunk:
						continue
					dest.write(chunk)
					progress.update_bytes(len(chunk))

		os.replace(temp_path, local_path_str)
		final_size = os.path.getsize(local_path_str)
		progress.set_file_size(file_index, final_size)

		return local_path_str

	def fetch_remote_file_size(
		self,
		repo_id: str,
		filename: str,
		revision: str,
		token: Optional[str] = None,
	) -> int:
		"""Best-effort size lookup for repositories that do not publish sibling metadata."""
		url = hf_hub_url(repo_id=repo_id, filename=filename, revision=revision)
		headers = self.auth_headers(token).as_dict()

		try:
			response = self.session.head(url, headers=headers, timeout=30, allow_redirects=True)
			response.raise_for_status()
			content_length = response.headers.get('Content-Length')
			if not content_length:
				return 0
			return max(int(content_length), 0)
		except (requests.RequestException, ValueError) as error:
			logger.debug('Unable to determine size for %s: %s', filename, error)
			return 0
