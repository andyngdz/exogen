"""Tests for the memory service module."""

from unittest.mock import MagicMock, patch

from sqlalchemy.orm import Session

from app.services.memory import GPU_MEMORY_ESTIMATE_FACTOR, MemoryService


class TestMemoryService:
	"""Tests for the MemoryService class."""

	def test_init_with_negative_device_index_returns_zero_gpu(self):
		"""Test MemoryService returns total_gpu=0 when device_index is negative."""
		mock_db = MagicMock(spec=Session)

		with (
			patch('app.services.memory.get_device_index', return_value=-2),
			patch('app.services.memory.psutil') as mock_psutil,
			patch('app.services.memory.device_service') as mock_device_service,
		):
			mock_psutil.virtual_memory.return_value.total = 16 * 1024**3  # 16GB RAM
			mock_device_service.is_cuda = True
			mock_device_service.is_mps = False

			service = MemoryService(mock_db)

			assert service.total_gpu == 0
			assert service.total_ram == 16 * 1024**3

	def test_init_with_cpu_mode_device_index_returns_zero_gpu(self):
		"""Test MemoryService returns total_gpu=0 when device_index is -1 (CPU mode)."""
		mock_db = MagicMock(spec=Session)

		with (
			patch('app.services.memory.get_device_index', return_value=-1),
			patch('app.services.memory.psutil') as mock_psutil,
			patch('app.services.memory.device_service') as mock_device_service,
		):
			mock_psutil.virtual_memory.return_value.total = 16 * 1024**3
			mock_device_service.is_cuda = True
			mock_device_service.is_mps = False

			service = MemoryService(mock_db)

			assert service.total_gpu == 0

	def test_init_with_valid_cuda_device_index(self):
		"""Test MemoryService queries GPU memory for valid device index."""
		mock_db = MagicMock(spec=Session)
		gpu_memory = 8 * 1024**3  # 8GB VRAM

		with (
			patch('app.services.memory.get_device_index', return_value=0),
			patch('app.services.memory.psutil') as mock_psutil,
			patch('app.services.memory.device_service') as mock_device_service,
			patch('app.services.memory.torch') as mock_torch,
		):
			mock_psutil.virtual_memory.return_value.total = 16 * 1024**3
			mock_device_service.is_cuda = True
			mock_device_service.is_mps = False
			mock_torch.cuda.get_device_properties.return_value.total_memory = gpu_memory

			service = MemoryService(mock_db)

			assert service.total_gpu == gpu_memory
			mock_torch.cuda.get_device_properties.assert_called_once_with(0)

	def test_init_with_mps_device(self):
		"""Test MemoryService estimates GPU memory for MPS devices."""
		mock_db = MagicMock(spec=Session)
		total_ram = 16 * 1024**3  # 16GB RAM

		with (
			patch('app.services.memory.get_device_index', return_value=0),
			patch('app.services.memory.psutil') as mock_psutil,
			patch('app.services.memory.device_service') as mock_device_service,
		):
			mock_psutil.virtual_memory.return_value.total = total_ram
			mock_device_service.is_cuda = False
			mock_device_service.is_mps = True

			service = MemoryService(mock_db)

			expected_gpu = int(total_ram * GPU_MEMORY_ESTIMATE_FACTOR)
			assert service.total_gpu == expected_gpu

	def test_init_with_mps_device_and_negative_device_index(self):
		"""Test MPS always estimates GPU memory regardless of device_index.

		MPS has only one GPU (Apple Silicon), so device_index is irrelevant.
		The stored device_index is used by frontend for device selection UI.
		"""
		mock_db = MagicMock(spec=Session)
		total_ram = 16 * 1024**3  # 16GB RAM

		with (
			patch('app.services.memory.get_device_index', return_value=-2),
			patch('app.services.memory.psutil') as mock_psutil,
			patch('app.services.memory.device_service') as mock_device_service,
		):
			mock_psutil.virtual_memory.return_value.total = total_ram
			mock_device_service.is_cuda = False
			mock_device_service.is_mps = True

			service = MemoryService(mock_db)

			expected_gpu = int(total_ram * GPU_MEMORY_ESTIMATE_FACTOR)
			assert service.total_gpu == expected_gpu

	def test_init_with_cpu_only_device(self):
		"""Test MemoryService returns zero GPU memory for CPU-only systems."""
		mock_db = MagicMock(spec=Session)

		with (
			patch('app.services.memory.get_device_index', return_value=0),
			patch('app.services.memory.psutil') as mock_psutil,
			patch('app.services.memory.device_service') as mock_device_service,
		):
			mock_psutil.virtual_memory.return_value.total = 16 * 1024**3
			mock_device_service.is_cuda = False
			mock_device_service.is_mps = False

			service = MemoryService(mock_db)

			assert service.total_gpu == 0
