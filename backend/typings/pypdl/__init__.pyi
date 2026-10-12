"""Type stubs for pypdl library."""

class Pypdl:
	"""Pypdl downloader class."""

	def __init__(self) -> None: ...
	def start(
		self,
		url: str,
		file_path: str,
		retries: int = 3,
		etag_validation: bool = False,
		**kwargs,
	) -> None: ...
