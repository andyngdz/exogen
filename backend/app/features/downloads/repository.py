import json
from typing import List, Optional, Union

from huggingface_hub import DatasetInfo, HfApi, ModelInfo, SpaceInfo, hf_hub_download
from huggingface_hub.errors import EntryNotFoundError

from app.schemas.downloads import RepositoryFileSize, RepositoryFileSizes

RepoInfo = Union[ModelInfo, DatasetInfo, SpaceInfo]


class HuggingFaceRepository:
	"""Handles HuggingFace repository metadata operations."""

	def __init__(self, api: Optional[HfApi] = None):
		self._api: Optional[HfApi] = api

	@property
	def api(self) -> HfApi:
		if self._api is None:
			self._api = HfApi()
		return self._api

	@api.setter
	def api(self, value: HfApi) -> None:
		self._api = value

	def get_repo_info(self, id: str) -> RepoInfo:
		"""Get repository information from HuggingFace Hub.

		Args:
			id: Repository ID (e.g., 'runwayml/stable-diffusion-v1-5')

		Returns:
			Repository information (ModelInfo, DatasetInfo, or SpaceInfo)
		"""
		return self.api.repo_info(id, files_metadata=True)

	def list_files(self, id: str, repo_info: Optional[RepoInfo] = None) -> List[str]:
		"""Get list of all files in a HuggingFace repository."""
		info = repo_info or self.api.repo_info(id, files_metadata=True)

		if not info.siblings:
			return []

		return [sibling.rfilename for sibling in info.siblings]

	def get_file_sizes_map(self, id: str, repo_info: Optional[RepoInfo] = None) -> RepositoryFileSizes:
		"""Get structured file size metadata for a HuggingFace repository."""
		info = repo_info or self.api.repo_info(id)

		if not info.siblings:
			return RepositoryFileSizes()

		entries = [
			RepositoryFileSize(
				filename=sibling.rfilename,
				size=getattr(sibling, 'size', 0) or 0,
			)
			for sibling in info.siblings
		]
		return RepositoryFileSizes(files=entries)

	def get_components(self, id: str, revision: Optional[str] = None) -> List[str]:
		"""Get list of model components from model_index.json."""
		try:
			model_index = hf_hub_download(
				repo_id=id,
				filename='model_index.json',
				repo_type='model',
				revision=revision,
			)
		except EntryNotFoundError:
			return []

		with open(model_index, 'r', encoding='utf-8') as file:
			data = json.load(file)

		components = []

		for key, value in data.items():
			if isinstance(value, list) and value[0] is not None:
				components.append(key)

		return components
