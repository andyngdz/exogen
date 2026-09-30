"""Downloads Feature Schemas"""

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, PrivateAttr


class DownloadPhase(str, Enum):
	"""Download progress phase indicators"""

	INIT = 'init'
	CHUNK = 'chunk'
	FILE_START = 'file_start'
	FILE_COMPLETE = 'file_complete'
	SIZE_UPDATE = 'size_update'
	COMPLETE = 'complete'


class DownloadModelRequest(BaseModel):
	"""Request model for downloading"""

	model_id: str = Field(
		...,
		description='The Hugging Face repository ID of the model to download.',
	)
	hf_token: Optional[str] = Field(
		default=None,
		description='Optional Hugging Face API token for private models or increased rate limits.',
	)


class DownloadModelStartResponse(BaseModel):
	"""
	Response model for preparing a download.
	Contains the list of files to be downloaded.
	"""

	model_id: str = Field(..., description='The repository ID of the model queued for download.')


class DownloadStepProgressResponse(BaseModel):
	"""
	Response model for a download step progress.
	"""

	model_id: str = Field(..., description='The repository ID of the model currently downloading.')
	step: int = Field(..., description='The current step of the download.')
	total: int = Field(..., description='The total number of steps in the download.')
	downloaded_size: int = Field(default=0, description='Total downloaded bytes so far.')
	total_downloaded_size: int = Field(default=0, description='Total number of bytes to download.')
	phase: DownloadPhase = Field(default=DownloadPhase.CHUNK, description='Progress phase indicator.')
	current_file: Optional[str] = Field(
		default=None,
		description='Name of the file currently being downloaded, if applicable.',
	)


class DownloadModelResponse(BaseModel):
	"""
	Response schema for the status of a model download.
	"""

	model_id: str = Field(..., description='The repository ID of the completed model download.')
	path: str = Field(..., description='The local directory path where the model is stored.')
	message: Optional[str] = Field(..., description='A human-readable message about the download status.')


class RepositoryFileSize(BaseModel):
	filename: str = Field(..., description='Relative path of the file in the repository.')
	size: int = Field(default=0, ge=0, description='File size in bytes.')


class RepositoryFileSizes(BaseModel):
	_files_dict: dict[str, RepositoryFileSize] = PrivateAttr(default_factory=dict)

	def __init__(self, files: Optional[list[RepositoryFileSize]] = None, **data):
		super().__init__(**data)
		if files:
			self._files_dict = {file.filename: file for file in files}

	@property
	def files(self) -> list[RepositoryFileSize]:
		"""Get list of files for backward compatibility."""
		return list(self._files_dict.values())

	def get_size(self, filename: str) -> int:
		file_meta = self._files_dict.get(filename)
		return file_meta.size if file_meta else 0

	def set_size(self, filename: str, size: int) -> None:
		normalized_size = max(size, 0)

		if filename in self._files_dict:
			self._files_dict[filename].size = normalized_size
		else:
			self._files_dict[filename] = RepositoryFileSize(filename=filename, size=normalized_size)


class AuthHeaders(BaseModel):
	authorization: Optional[str] = Field(default=None, description='Bearer token header value.')

	def as_dict(self) -> dict[str, str]:
		return {'Authorization': self.authorization} if self.authorization else {}


class DownloadProgressCache(BaseModel):
	payloads: dict[str, DownloadStepProgressResponse] = Field(default_factory=dict)

	def upsert(self, payload: DownloadStepProgressResponse) -> None:
		self.payloads[payload.model_id] = payload

	def pop(self, model_id: str) -> Optional[DownloadStepProgressResponse]:
		return self.payloads.pop(model_id, None)

	def pop_all(self) -> list[DownloadStepProgressResponse]:
		payloads = list(self.payloads.values())
		self.payloads.clear()
		return payloads

	def clear(self) -> None:
		"""Clear all cached payloads."""
		self.payloads.clear()

	def __bool__(self) -> bool:
		return bool(self.payloads)
