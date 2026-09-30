import json
from collections.abc import Generator
from pathlib import Path
from types import SimpleNamespace
from typing import cast
from unittest.mock import MagicMock, Mock, patch

import pytest
import requests
from huggingface_hub.errors import EntryNotFoundError
from requests import Session

from app.features.downloads.services import DownloadService


@pytest.fixture
def mock_service() -> Generator[tuple[DownloadService, Mock, Mock], None, None]:
	"""Create DownloadService with mocked dependencies."""
	with (
		patch('app.features.downloads.repository.HfApi') as mock_api,
		patch('app.features.downloads.services.model_service') as mock_model_service,
		patch('app.features.downloads.services.storage_service') as mock_storage_service,
	):
		mock_storage_service.get_model_dir.return_value = '/tmp/test-models'

		service = DownloadService()
		service.repository.api = mock_api
		service.file_downloader.session = MagicMock(spec=Session)

		yield service, mock_model_service, mock_storage_service


@pytest.fixture
def mock_progress() -> Mock:
	"""Create mock progress tracker."""
	progress = Mock()
	progress.set_file_size = Mock()
	progress.update_bytes = Mock()
	progress.start_file = Mock()
	progress.update = Mock()
	progress.close = Mock()
	return progress


class TestDownloadServiceInit:
	def test_creates_executor_and_modules(self, mock_service: tuple[DownloadService, Mock, Mock]) -> None:
		service, _, _ = mock_service
		assert service.executor is not None
		assert hasattr(service, 'repository')
		assert hasattr(service, 'file_downloader')


class TestDownloadServiceStart:
	@pytest.mark.asyncio
	async def test_invokes_download_model_in_executor(self, mock_service: tuple[DownloadService, Mock, Mock]) -> None:
		service, _, _ = mock_service
		mock_db = Mock()

		with patch.object(service, 'download_model', return_value='/fake/path') as mock_download:
			result = await service.start('test/repo', mock_db)

			assert result == '/fake/path'
			mock_download.assert_called_once_with('test/repo', mock_db)


class TestDownloadModelValidation:
	@pytest.mark.parametrize(
		'model_id,error_msg',
		[
			('', 'Model ID cannot be empty'),
			('   ', 'Model ID cannot be empty'),
		],
	)
	def test_raises_error_for_invalid_model_id(
		self, mock_service: tuple[DownloadService, Mock, Mock], model_id: str, error_msg: str
	) -> None:
		service, _, _ = mock_service
		with pytest.raises(ValueError, match=error_msg):
			service.download_model(model_id, Mock())


class TestDownloadModel:
	def test_returns_none_when_no_files_to_download(
		self, mock_service: tuple[DownloadService, Mock, Mock], monkeypatch: pytest.MonkeyPatch
	) -> None:
		service, _, _ = mock_service
		cast(Mock, service.repository.api).repo_info.return_value = SimpleNamespace(sha='main', siblings=[])

		def mock_get_components(*args: object, **kwargs: object) -> list[str]:
			return []

		def mock_list_files(*args: object, **kwargs: object) -> list[str]:
			return []

		monkeypatch.setattr(service.repository, 'get_components', mock_get_components)
		monkeypatch.setattr(service.repository, 'list_files', mock_list_files)

		result = service.download_model('test/repo', Mock())

		assert result is None

	def test_logs_error_when_database_save_fails(
		self, mock_service: tuple[DownloadService, Mock, Mock], tmp_path: Path, monkeypatch: pytest.MonkeyPatch
	) -> None:
		service, mock_model_service, mock_storage_service = mock_service
		mock_storage_service.get_model_dir.return_value = str(tmp_path)
		mock_model_service.add_model.side_effect = ValueError('DB error')

		model_index = tmp_path / 'model_index.json'
		model_index.write_text(json.dumps({'unet': ['cfg']}))

		cast(Mock, service.repository.api).repo_info.return_value = SimpleNamespace(
			sha='main', siblings=[SimpleNamespace(rfilename='unet/model.bin', size=10)]
		)

		def mock_get_components(*args: object, **kwargs: object) -> list[str]:
			return ['unet']

		def mock_list_files(*args: object, **kwargs: object) -> list[str]:
			return ['unet/model.bin']

		monkeypatch.setattr(service.repository, 'get_components', mock_get_components)
		monkeypatch.setattr(service.repository, 'list_files', mock_list_files)

		def fake_download(**kwargs: str) -> str:
			path = tmp_path / 'snapshots' / 'main' / kwargs['filename']
			path.parent.mkdir(parents=True, exist_ok=True)
			path.write_bytes(b'test')
			return str(path)

		monkeypatch.setattr(service.file_downloader, 'download_file', fake_download)

		with (
			patch('app.features.downloads.services.logger') as mock_logger,
			patch('app.features.downloads.repository.hf_hub_download', return_value=str(model_index)),
		):
			result = service.download_model('test/repo', Mock())
			assert result is not None
			mock_logger.error.assert_called_once()

	def test_closes_progress_on_exception(
		self, mock_service: tuple[DownloadService, Mock, Mock], tmp_path: Path, monkeypatch: pytest.MonkeyPatch
	) -> None:
		service, _, mock_storage_service = mock_service
		mock_storage_service.get_model_dir.return_value = str(tmp_path)

		model_index = tmp_path / 'model_index.json'
		model_index.write_text(json.dumps({'unet': ['cfg']}))

		cast(Mock, service.repository.api).repo_info.return_value = SimpleNamespace(
			sha='main', siblings=[SimpleNamespace(rfilename='unet/model.bin', size=10)]
		)

		def mock_get_components(*args: object, **kwargs: object) -> list[str]:
			return ['unet']

		def mock_list_files(*args: object, **kwargs: object) -> list[str]:
			return ['unet/model.bin']

		monkeypatch.setattr(service.repository, 'get_components', mock_get_components)
		monkeypatch.setattr(service.repository, 'list_files', mock_list_files)
		monkeypatch.setattr(service.file_downloader, 'download_file', Mock(side_effect=ConnectionError('Failed')))

		mock_progress = Mock()
		with (
			patch('app.features.downloads.services.DownloadTqdm', return_value=mock_progress),
			patch('app.features.downloads.repository.hf_hub_download', return_value=str(model_index)),
		):
			with pytest.raises(ConnectionError):
				service.download_model('test/repo', Mock())

		mock_progress.close.assert_called_once()

	def test_downloads_all_files_when_model_index_missing(
		self, mock_service: tuple[DownloadService, Mock, Mock], tmp_path: Path, monkeypatch: pytest.MonkeyPatch
	) -> None:
		from app.schemas.downloads import RepositoryFileSize, RepositoryFileSizes

		service, _, mock_storage_service = mock_service
		mock_storage_service.get_model_dir.return_value = str(tmp_path)

		repo_files = ['tokenizer.json', 'weights.bin']
		cast(Mock, service.repository.api).repo_info.return_value = SimpleNamespace(
			sha='main',
			siblings=[
				SimpleNamespace(rfilename='tokenizer.json', size=5),
				SimpleNamespace(rfilename='weights.bin', size=10),
			],
		)

		def mock_get_components(*args: object, **kwargs: object) -> list[str]:
			return []

		def mock_list_files(*args: object, **kwargs: object) -> list[str]:
			return list(repo_files)

		monkeypatch.setattr(service.repository, 'get_components', mock_get_components)
		monkeypatch.setattr(service.repository, 'list_files', mock_list_files)

		mock_sizes = RepositoryFileSizes(
			files=[
				RepositoryFileSize(filename='tokenizer.json', size=5),
				RepositoryFileSize(filename='weights.bin', size=10),
			]
		)

		def mock_get_file_sizes_map(*args: object, **kwargs: object) -> RepositoryFileSizes:
			return mock_sizes

		monkeypatch.setattr(service.repository, 'get_file_sizes_map', mock_get_file_sizes_map)

		downloaded_files: list[str] = []

		def fake_download(**kwargs: str) -> str:
			downloaded_files.append(kwargs['filename'])
			path = tmp_path / 'snapshots' / 'main' / kwargs['filename']
			path.parent.mkdir(parents=True, exist_ok=True)
			path.write_bytes(b'data')
			return str(path)

		monkeypatch.setattr(service.file_downloader, 'download_file', fake_download)

		with patch('app.features.downloads.services.logger') as mock_logger:
			result = service.download_model('test/repo', Mock())

		assert result is not None
		assert downloaded_files == ['tokenizer.json', 'weights.bin']
		mock_logger.warning.assert_any_call('model_index.json not found for %s, downloading entire repository', 'test/repo')


class TestGetIgnoreComponents:
	@pytest.mark.parametrize(
		'files,scopes,expected',
		[
			# Test: Standard safetensors exists → filter .bin duplicates
			(
				['unet/model.safetensors', 'unet/model.bin'],
				['unet/*'],
				['unet/model.bin'],
			),
			# Test: Standard safetensors exists → filter ALL variants
			(
				['unet/model.safetensors', 'unet/model.fp16.safetensors', 'unet/model.non_ema.safetensors'],
				['unet/*'],
				['unet/model.fp16.safetensors', 'unet/model.non_ema.safetensors'],
			),
			# Test: No standard safetensors → keep .bin, keep fp16 variant (no standard to prefer)
			(
				['unet/model.bin', 'unet/model.fp16.bin'],
				['unet/*'],
				[],
			),
			# Test: Only fp16 safetensors (no standard) → Keep fp16
			(
				['unet/model.fp16.safetensors'],
				['unet/*'],
				[],
			),
			# Test: Only non_ema safetensors (no standard) → Keep non_ema
			(
				['unet/model.non_ema.safetensors'],
				['unet/*'],
				[],
			),
			# Test: Only ema_only safetensors (no standard) → Keep ema_only
			(
				['unet/model.ema_only.safetensors'],
				['unet/*'],
				[],
			),
			# Test: Realistic Juggernaut-XL-v9 scenario (fp16-only across multiple components)
			(
				[
					'text_encoder/model.fp16.safetensors',
					'text_encoder_2/model.fp16.safetensors',
					'unet/diffusion_pytorch_model.fp16.safetensors',
					'vae/diffusion_pytorch_model.fp16.safetensors',
				],
				['text_encoder/*', 'text_encoder_2/*', 'unet/*', 'vae/*'],
				[],
			),
			# Test: Realistic SD 1.5 scenario
			(
				[
					'unet/diffusion_pytorch_model.safetensors',
					'unet/diffusion_pytorch_model.bin',
					'unet/diffusion_pytorch_model.fp16.safetensors',
					'unet/diffusion_pytorch_model.non_ema.safetensors',
				],
				['unet/*'],
				[
					'unet/diffusion_pytorch_model.bin',
					'unet/diffusion_pytorch_model.fp16.safetensors',
					'unet/diffusion_pytorch_model.non_ema.safetensors',
				],
			),
			# Test: Empty files
			([], ['unet/*'], []),
			# Test: Files outside scope are not affected
			(['out_of_scope/model.non_ema.safetensors'], ['unet/*'], []),
		],
	)
	def test_filters_bloat_files_correctly(self, files: list[str], scopes: list[str], expected: list[str]) -> None:
		from app.features.downloads.filters import get_ignore_components

		result = get_ignore_components(files, scopes)
		assert sorted(result) == sorted(expected)


class TestListFiles:
	def test_returns_filenames_from_siblings(self) -> None:
		from app.features.downloads.repository import HuggingFaceRepository

		repository = HuggingFaceRepository()
		mock_api = Mock()
		mock_api.repo_info.return_value = SimpleNamespace(
			siblings=[
				SimpleNamespace(rfilename='a.txt'),
				SimpleNamespace(rfilename='b/c.bin'),
			]
		)
		repository.api = mock_api

		result = repository.list_files('test/repo')

		assert result == ['a.txt', 'b/c.bin']

	def test_handles_empty_siblings(self) -> None:
		from app.features.downloads.repository import HuggingFaceRepository

		repository = HuggingFaceRepository()
		mock_api = Mock()
		mock_api.repo_info.return_value = SimpleNamespace(siblings=[])
		repository.api = mock_api

		result = repository.list_files('test/repo')

		assert result == []


class TestGetFileSizesMap:
	def test_returns_size_dict(self) -> None:
		from app.features.downloads.repository import HuggingFaceRepository

		repository = HuggingFaceRepository()
		mock_api = Mock()
		mock_api.repo_info.return_value = SimpleNamespace(
			siblings=[
				SimpleNamespace(rfilename='file1.bin', size=100),
				SimpleNamespace(rfilename='file2.bin', size=200),
			]
		)
		repository.api = mock_api

		result = repository.get_file_sizes_map('test/repo')

		assert result.get_size('file1.bin') == 100
		assert result.get_size('file2.bin') == 200

	def test_handles_missing_size_attribute(self) -> None:
		from app.features.downloads.repository import HuggingFaceRepository

		repository = HuggingFaceRepository()
		mock_api = Mock()
		mock_api.repo_info.return_value = SimpleNamespace(
			siblings=[
				SimpleNamespace(rfilename='file1.bin', size=100),
				SimpleNamespace(rfilename='file2.bin'),
				SimpleNamespace(rfilename='file3.bin', size=None),
			]
		)
		repository.api = mock_api

		result = repository.get_file_sizes_map('test/repo')

		assert result.get_size('file1.bin') == 100
		assert result.get_size('file2.bin') == 0
		assert result.get_size('file3.bin') == 0


class TestGetComponents:
	def test_parses_model_index_json(self, tmp_path: Path) -> None:
		from app.features.downloads.repository import HuggingFaceRepository

		repository = HuggingFaceRepository()
		model_index = tmp_path / 'model_index.json'
		model_index.write_text(
			json.dumps(
				{
					'unet': ['config'],
					'vae': [None],
					'scheduler': 'not-a-list',
				}
			)
		)

		with patch('app.features.downloads.repository.hf_hub_download', return_value=str(model_index)):
			result = repository.get_components('test/repo')

		assert result == ['unet']

	def test_handles_malformed_json(self, tmp_path: Path) -> None:
		from app.features.downloads.repository import HuggingFaceRepository

		repository = HuggingFaceRepository()
		model_index = tmp_path / 'model_index.json'
		model_index.write_text('invalid json')

		with patch('app.features.downloads.repository.hf_hub_download', return_value=str(model_index)):
			with pytest.raises(json.JSONDecodeError):
				repository.get_components('test/repo')

	def test_returns_empty_list_when_model_index_missing(self) -> None:
		from app.features.downloads.repository import HuggingFaceRepository

		repository = HuggingFaceRepository()

		with patch(
			'app.features.downloads.repository.hf_hub_download',
			side_effect=EntryNotFoundError('missing model_index.json'),
		):
			result = repository.get_components('test/repo')

		assert result == []


class TestAuthHeaders:
	@pytest.mark.parametrize(
		'token,expected',
		[
			(None, None),
			('test-token-123', 'Bearer test-token-123'),
		],
	)
	def test_builds_headers_correctly(self, token: str | None, expected: str | None) -> None:
		from app.features.downloads.file_downloader import FileDownloader

		downloader = FileDownloader()
		result = downloader.auth_headers(token)
		assert result.authorization == expected


class TestDownloadFile:
	def test_skips_when_file_exists(self, mock_progress: Mock, tmp_path: Path) -> None:
		from app.features.downloads.file_downloader import FileDownloader

		downloader = FileDownloader()
		snapshot_dir = tmp_path / 'snapshots'
		snapshot_dir.mkdir()
		existing = snapshot_dir / 'model.bin'
		existing.write_bytes(b'existing')

		with patch('app.features.downloads.file_downloader.logger'):
			result = downloader.download_file(
				repo_id='test/repo',
				filename='model.bin',
				revision='main',
				snapshot_dir=str(snapshot_dir),
				file_index=0,
				progress=mock_progress,
				file_size=5,
			)

		assert result == str(existing)
		mock_progress.set_file_size.assert_called_once_with(0, 8)
		mock_progress.update_bytes.assert_not_called()

	def test_removes_zero_size_files(self, mock_progress: Mock, tmp_path: Path) -> None:
		from app.features.downloads.file_downloader import FileDownloader

		downloader = FileDownloader()
		downloader.session = MagicMock(spec=requests.Session)
		snapshot_dir = tmp_path / 'snapshots'
		snapshot_dir.mkdir()
		zero_file = snapshot_dir / 'model.bin'
		zero_file.write_bytes(b'')

		mock_response = Mock()
		mock_response.headers.get.return_value = '5'
		mock_response.iter_content.return_value = [b'hello']

		def mock_enter(self: object) -> Mock:
			return mock_response

		def mock_exit(*args: object) -> None:
			# sonarqube(python:S1186): This method is intentionally empty
			# as it serves as a mock for a context manager's __exit__
			# method in tests, and no cleanup is required for the mock.
			pass

		mock_response.__enter__ = mock_enter
		mock_response.__exit__ = mock_exit

		downloader.session.get.return_value = mock_response
		result = downloader.download_file(
			repo_id='test/repo',
			filename='model.bin',
			revision='main',
			snapshot_dir=str(snapshot_dir),
			file_index=0,
			progress=mock_progress,
			file_size=8,
		)

		assert Path(result).read_bytes() == b'hello'

	def test_downloads_successfully(self, mock_progress: Mock, tmp_path: Path) -> None:
		from app.features.downloads.file_downloader import FileDownloader

		downloader = FileDownloader()
		downloader.session = MagicMock(spec=requests.Session)
		snapshot_dir = tmp_path / 'snapshots'
		snapshot_dir.mkdir()

		mock_response = Mock()
		mock_response.headers.get.return_value = '10'
		mock_response.iter_content.return_value = [b'hello', b'world']

		def mock_enter(self: object) -> Mock:
			return mock_response

		def mock_exit(*args: object) -> None:
			# sonarqube(python:S1186): This method is intentionally empty
			# as it serves as a mock for a context manager's __exit__
			# method in tests, and no cleanup is required for the mock.
			pass

		mock_response.__enter__ = mock_enter
		mock_response.__exit__ = mock_exit

		downloader.session.get.return_value = mock_response
		result = downloader.download_file(
			repo_id='test/repo',
			filename='model.bin',
			revision='main',
			snapshot_dir=str(snapshot_dir),
			file_index=0,
			progress=mock_progress,
			file_size=8,
		)

		assert Path(result).read_bytes() == b'helloworld'
		assert mock_progress.update_bytes.call_count == 2

	def test_keeps_part_file_on_error(self, mock_progress: Mock, tmp_path: Path) -> None:
		from app.features.downloads.file_downloader import FileDownloader

		downloader = FileDownloader()
		downloader.session = MagicMock(spec=requests.Session)
		snapshot_dir = tmp_path / 'snapshots'
		snapshot_dir.mkdir()

		mock_response = Mock()
		mock_response.headers.get.return_value = '10'
		mock_response.iter_content.side_effect = ConnectionError('Network error')

		def mock_enter(self: object) -> Mock:
			return mock_response

		def mock_exit(*args: object) -> None:
			# sonarqube(python:S1186): This method is intentionally empty
			# as it serves as a mock for a context manager's __exit__
			# method in tests, and no cleanup is required for the mock.
			pass

		mock_response.__enter__ = mock_enter
		mock_response.__exit__ = mock_exit

		downloader.session.get.return_value = mock_response
		with pytest.raises(ConnectionError):
			downloader.download_file(
				repo_id='test/repo',
				filename='model.bin',
				revision='main',
				snapshot_dir=str(snapshot_dir),
				file_index=0,
				progress=mock_progress,
				file_size=10,
			)

		assert (snapshot_dir / 'model.bin.part').exists()

	def test_resumes_download_if_part_file_exists(self, mock_progress: Mock, tmp_path: Path) -> None:
		from app.features.downloads.file_downloader import FileDownloader

		downloader = FileDownloader()
		downloader.session = MagicMock(spec=requests.Session)
		snapshot_dir = tmp_path / 'snapshots'
		snapshot_dir.mkdir()
		part_file = snapshot_dir / 'model.bin.part'
		part_file.write_bytes(b'hello')

		mock_response = Mock()
		mock_response.status_code = 206
		mock_response.headers.get.return_value = '5'  # Remaining bytes
		mock_response.iter_content.return_value = [b'world']

		def mock_enter(self: object) -> Mock:
			return mock_response

		def mock_exit(*args: object) -> None:
			# sonarqube(python:S1186): This method is intentionally empty
			# as it serves as a mock for a context manager's __exit__
			# method in tests, and no cleanup is required for the mock.
			pass

		mock_response.__enter__ = mock_enter
		mock_response.__exit__ = mock_exit

		downloader.session.get.return_value = mock_response
		result = downloader.download_file(
			repo_id='test/repo',
			filename='model.bin',
			revision='main',
			snapshot_dir=str(snapshot_dir),
			file_index=0,
			progress=mock_progress,
			file_size=10,
		)

		assert Path(result).read_bytes() == b'helloworld'
		mock_progress.register_existing_bytes.assert_called_once_with(5)
		downloader.session.get.assert_called_once()
		call_kwargs = downloader.session.get.call_args[1]
		assert call_kwargs['headers']['Range'] == 'bytes=5-'


class TestFetchRemoteFileSize:
	def test_returns_content_length(self) -> None:
		from app.features.downloads.file_downloader import FileDownloader

		downloader = FileDownloader()
		downloader.session = MagicMock(spec=requests.Session)
		mock_response = Mock()
		mock_response.headers.get.return_value = '12345'

		downloader.session.head.return_value = mock_response
		size = downloader.fetch_remote_file_size('test/repo', 'model.bin', 'main')

		assert size == 12345

	@pytest.mark.parametrize(
		'header_value,expected',
		[
			(None, 0),
			('invalid', 0),
			('-100', 0),
		],
	)
	def test_handles_invalid_content_length(self, header_value: str | None, expected: int) -> None:
		from app.features.downloads.file_downloader import FileDownloader

		downloader = FileDownloader()
		downloader.session = MagicMock(spec=requests.Session)
		mock_response = Mock()
		mock_response.headers.get.return_value = header_value

		downloader.session.head.return_value = mock_response
		size = downloader.fetch_remote_file_size('test/repo', 'model.bin', 'main')

		assert size == expected

	def test_handles_http_error(self) -> None:
		from app.features.downloads.file_downloader import FileDownloader

		downloader = FileDownloader()
		downloader.session = MagicMock(spec=requests.Session)

		downloader.session.head.side_effect = requests.RequestException('HTTP 404')
		size = downloader.fetch_remote_file_size('test/repo', 'model.bin', 'main')

		assert size == 0
