from types import SimpleNamespace
from unittest.mock import patch

import pytest

from app.services.device import DeviceType


class TestDeviceServiceInit:
	def test_initializes_with_cuda_when_available(self):
		with patch('app.services.device.torch') as mock_torch:
			mock_torch.cuda.is_available.return_value = True
			mock_torch.cuda.get_device_name.return_value = 'NVIDIA RTX 3090'
			mock_torch.float16 = 'float16'
			mock_torch.backends.mps.is_available.return_value = False

			from app.services.device import DeviceService

			service = DeviceService()

			assert service.device == DeviceType.CUDA
			assert service.torch_dtype == 'float16'

	def test_initializes_with_mps_when_cuda_unavailable(self):
		with (
			patch('app.services.device.torch') as mock_torch,
			patch('app.services.device.platform') as mock_platform,
		):
			mock_torch.cuda.is_available.return_value = False
			mock_torch.backends.mps.is_available.return_value = True
			mock_torch.float32 = 'float32'
			mock_platform.machine.return_value = 'arm64'

			from app.services.device import DeviceService

			service = DeviceService()

			assert service.device == DeviceType.MPS
			assert service.torch_dtype == 'float32'

	def test_initializes_with_cpu_when_no_gpu(self):
		with patch('app.services.device.torch') as mock_torch:
			mock_torch.cuda.is_available.return_value = False
			mock_torch.backends.mps.is_available.return_value = False
			mock_torch.float32 = 'float32'

			from app.services.device import DeviceService

			service = DeviceService()

			assert service.device == DeviceType.CPU
			assert service.torch_dtype == 'float32'

	def test_falls_back_to_cpu_on_exception(self):
		with patch('app.services.device.torch') as mock_torch:
			mock_torch.cuda.is_available.side_effect = RuntimeError('CUDA error')
			mock_torch.float32 = 'float32'

			from app.services.device import DeviceService

			service = DeviceService()

			assert service.device == DeviceType.CPU
			assert service.torch_dtype == 'float32'


class TestGetDeviceName:
	def test_returns_cuda_device_name_successfully(self):
		with patch('app.services.device.torch') as mock_torch:
			mock_torch.cuda.is_available.return_value = True
			mock_torch.cuda.get_device_name.return_value = 'NVIDIA GeForce RTX 3090'
			mock_torch.float16 = 'float16'
			mock_torch.backends.mps.is_available.return_value = False

			from app.services.device import DeviceService

			service = DeviceService()
			result = service.get_device_name(0)

			assert result == 'NVIDIA GeForce RTX 3090'

	def test_returns_fallback_cuda_name_on_error(self):
		with patch('app.services.device.torch') as mock_torch:
			mock_torch.cuda.is_available.return_value = True
			mock_torch.cuda.get_device_name.side_effect = [
				'NVIDIA RTX 3090',  # For init
				RuntimeError('CUDA error'),  # For get_device_name call
			]
			mock_torch.float16 = 'float16'
			mock_torch.backends.mps.is_available.return_value = False

			from app.services.device import DeviceService

			service = DeviceService()
			result = service.get_device_name(0)

			assert result == 'cuda:0'

	def test_returns_apple_silicon_name_for_mps(self):
		with (
			patch('app.services.device.torch') as mock_torch,
			patch('app.services.device.platform') as mock_platform,
		):
			mock_torch.cuda.is_available.return_value = False
			mock_torch.backends.mps.is_available.return_value = True
			mock_torch.float32 = 'float32'
			mock_platform.machine.return_value = 'arm64'

			from app.services.device import DeviceService

			service = DeviceService()
			result = service.get_device_name(0)

			assert result == 'Apple arm64'

	def test_returns_cpu_for_cpu_only(self):
		with patch('app.services.device.torch') as mock_torch:
			mock_torch.cuda.is_available.return_value = False
			mock_torch.backends.mps.is_available.return_value = False
			mock_torch.float32 = 'float32'

			from app.services.device import DeviceService

			service = DeviceService()
			result = service.get_device_name(0)

			assert result == 'cpu'

	def test_handles_different_device_indices(self):
		with patch('app.services.device.torch') as mock_torch:
			mock_torch.cuda.is_available.return_value = True
			mock_torch.cuda.get_device_name.side_effect = [
				'GPU 0',  # For init
				'GPU 1',  # For get_device_name(1)
			]
			mock_torch.float16 = 'float16'
			mock_torch.backends.mps.is_available.return_value = False

			from app.services.device import DeviceService

			service = DeviceService()
			result = service.get_device_name(1)

			assert result == 'GPU 1'


class TestGetDeviceProperties:
	def test_returns_properties_for_cuda(self):
		with patch('app.services.device.torch') as mock_torch:
			mock_torch.cuda.is_available.return_value = True
			mock_torch.cuda.get_device_name.return_value = 'NVIDIA RTX 3090'
			mock_torch.float16 = 'float16'
			mock_torch.backends.mps.is_available.return_value = False

			props = SimpleNamespace(total_memory=12345678, name='GPU')
			mock_torch.cuda.get_device_properties.return_value = props

			from app.services.device import DeviceService

			service = DeviceService()
			result = service.get_device_properties(0)

			assert result == props
			assert result is not None
			assert result.total_memory == 12345678

	def test_returns_none_on_cuda_error(self):
		with patch('app.services.device.torch') as mock_torch:
			mock_torch.cuda.is_available.return_value = True
			mock_torch.cuda.get_device_name.return_value = 'NVIDIA RTX 3090'
			mock_torch.cuda.get_device_properties.side_effect = RuntimeError('CUDA error')
			mock_torch.float16 = 'float16'
			mock_torch.backends.mps.is_available.return_value = False

			from app.services.device import DeviceService

			service = DeviceService()
			result = service.get_device_properties(0)

			assert result is None

	def test_returns_none_for_mps(self):
		with (
			patch('app.services.device.torch') as mock_torch,
			patch('app.services.device.platform') as mock_platform,
		):
			mock_torch.cuda.is_available.return_value = False
			mock_torch.backends.mps.is_available.return_value = True
			mock_torch.float32 = 'float32'
			mock_platform.machine.return_value = 'arm64'

			from app.services.device import DeviceService

			service = DeviceService()
			result = service.get_device_properties(0)

			assert result is None

	def test_returns_none_for_cpu(self):
		with patch('app.services.device.torch') as mock_torch:
			mock_torch.cuda.is_available.return_value = False
			mock_torch.backends.mps.is_available.return_value = False
			mock_torch.float32 = 'float32'

			from app.services.device import DeviceService

			service = DeviceService()
			result = service.get_device_properties(0)

			assert result is None


class TestIsCudaProperty:
	def test_returns_true_when_device_is_cuda(self):
		with patch('app.services.device.torch') as mock_torch:
			mock_torch.cuda.is_available.return_value = True
			mock_torch.cuda.get_device_name.return_value = 'GPU'
			mock_torch.float16 = 'float16'
			mock_torch.backends.mps.is_available.return_value = False

			from app.services.device import DeviceService

			service = DeviceService()

			assert service.is_cuda is True

	def test_returns_false_when_device_is_not_cuda(self):
		with patch('app.services.device.torch') as mock_torch:
			mock_torch.cuda.is_available.return_value = False
			mock_torch.backends.mps.is_available.return_value = False
			mock_torch.float32 = 'float32'

			from app.services.device import DeviceService

			service = DeviceService()

			assert service.is_cuda is False


class TestIsMpsProperty:
	def test_returns_true_when_device_is_mps(self):
		with (
			patch('app.services.device.torch') as mock_torch,
			patch('app.services.device.platform') as mock_platform,
		):
			mock_torch.cuda.is_available.return_value = False
			mock_torch.backends.mps.is_available.return_value = True
			mock_torch.float32 = 'float32'
			mock_platform.machine.return_value = 'arm64'

			from app.services.device import DeviceService

			service = DeviceService()

			assert service.is_mps is True

	def test_returns_false_when_device_is_not_mps(self):
		with patch('app.services.device.torch') as mock_torch:
			mock_torch.cuda.is_available.return_value = True
			mock_torch.cuda.get_device_name.return_value = 'GPU'
			mock_torch.float16 = 'float16'
			mock_torch.backends.mps.is_available.return_value = False

			from app.services.device import DeviceService

			service = DeviceService()

			assert service.is_mps is False


class TestCurrentDeviceProperty:
	def test_returns_current_device_index_for_cuda(self):
		with patch('app.services.device.torch') as mock_torch:
			mock_torch.cuda.is_available.return_value = True
			mock_torch.cuda.get_device_name.return_value = 'GPU'
			mock_torch.cuda.current_device.return_value = 1
			mock_torch.float16 = 'float16'
			mock_torch.backends.mps.is_available.return_value = False

			from app.services.device import DeviceService

			service = DeviceService()
			result = service.current_device

			assert result == 1

	def test_returns_0_for_mps_and_cpu(self):
		with patch('app.services.device.torch') as mock_torch:
			mock_torch.cuda.is_available.return_value = False
			mock_torch.backends.mps.is_available.return_value = False
			mock_torch.float32 = 'float32'

			from app.services.device import DeviceService

			service = DeviceService()
			result = service.current_device

			assert result == 0


class TestDeviceCountProperty:
	def test_returns_device_count_for_cuda(self):
		with patch('app.services.device.torch') as mock_torch:
			mock_torch.cuda.is_available.return_value = True
			mock_torch.cuda.get_device_name.return_value = 'GPU'
			mock_torch.cuda.device_count.return_value = 2
			mock_torch.float16 = 'float16'
			mock_torch.backends.mps.is_available.return_value = False

			from app.services.device import DeviceService

			service = DeviceService()
			result = service.device_count

			assert result == 2

	def test_returns_1_for_mps(self):
		with (
			patch('app.services.device.torch') as mock_torch,
			patch('app.services.device.platform') as mock_platform,
		):
			mock_torch.cuda.is_available.return_value = False
			mock_torch.backends.mps.is_available.return_value = True
			mock_torch.float32 = 'float32'
			mock_platform.machine.return_value = 'arm64'

			from app.services.device import DeviceService

			service = DeviceService()
			result = service.device_count

			assert result == 1

	def test_returns_0_for_cpu(self):
		with patch('app.services.device.torch') as mock_torch:
			mock_torch.cuda.is_available.return_value = False
			mock_torch.backends.mps.is_available.return_value = False
			mock_torch.float32 = 'float32'

			from app.services.device import DeviceService

			service = DeviceService()
			result = service.device_count

			assert result == 0


class TestIsAvailableProperty:
	def test_returns_true_for_cuda_when_available(self):
		with patch('app.services.device.torch') as mock_torch:
			mock_torch.cuda.is_available.return_value = True
			mock_torch.cuda.get_device_name.return_value = 'GPU'
			mock_torch.float16 = 'float16'
			mock_torch.backends.mps.is_available.return_value = False

			from app.services.device import DeviceService

			service = DeviceService()
			result = service.is_available

			assert result is True

	def test_returns_true_for_mps_when_available(self):
		with (
			patch('app.services.device.torch') as mock_torch,
			patch('app.services.device.platform') as mock_platform,
		):
			mock_torch.cuda.is_available.return_value = False
			mock_torch.backends.mps.is_available.return_value = True
			mock_torch.float32 = 'float32'
			mock_platform.machine.return_value = 'arm64'

			from app.services.device import DeviceService

			service = DeviceService()
			result = service.is_available

			assert result is True

	def test_returns_false_for_cpu(self):
		with patch('app.services.device.torch') as mock_torch:
			mock_torch.cuda.is_available.return_value = False
			mock_torch.backends.mps.is_available.return_value = False
			mock_torch.float32 = 'float32'

			from app.services.device import DeviceService

			service = DeviceService()
			result = service.is_available

			assert result is False


class TestGetRecommendedBatchSize:
	def test_returns_1_for_cpu_only(self):
		with patch('app.services.device.torch') as mock_torch:
			mock_torch.cuda.is_available.return_value = False
			mock_torch.backends.mps.is_available.return_value = False

			from app.services.device import DeviceService

			service = DeviceService()

			result = service.get_recommended_batch_size()

			assert result == 1

	def test_returns_2_for_mps(self):
		with patch('app.services.device.torch') as mock_torch:
			mock_torch.cuda.is_available.return_value = False
			mock_torch.backends.mps.is_available.return_value = True
			mock_torch.float32 = 'float32'

			from app.services.device import DeviceService

			service = DeviceService()

			result = service.get_recommended_batch_size()

			assert result == 2

	def test_returns_1_when_cuda_props_unavailable(self):
		with patch('app.services.device.torch') as mock_torch:
			mock_torch.cuda.is_available.return_value = True
			mock_torch.backends.mps.is_available.return_value = False
			mock_torch.float16 = 'float16'

			from app.services.device import DeviceService

			service = DeviceService()
			with patch.object(service, 'get_device_properties', return_value=None):
				result = service.get_recommended_batch_size()

			assert result == 1

	@pytest.mark.parametrize(
		'total_memory_bytes,expected_batch_size',
		[
			(2 * 1024**3, 1),  # 2GB < 4GB -> 1 image
			(3 * 1024**3, 1),  # 3GB < 4GB -> 1 image
			(3.9 * 1024**3, 1),  # 3.9GB < 4GB -> 1 image
			(4 * 1024**3, 2),  # 4GB: not < 4, checks < 8 -> 2 images
			(6 * 1024**3, 2),  # 6GB < 8GB -> 2 images
			(7.9 * 1024**3, 2),  # 7.9GB < 8GB -> 2 images
			(8 * 1024**3, 3),  # 8GB: not < 8, checks < 12 -> 3 images
			(10 * 1024**3, 3),  # 10GB < 12GB -> 3 images
			(11.63 * 1024**3, 3),  # 11.63GB (user's GPU) < 12GB -> 3 images
			(12 * 1024**3, 4),  # 12GB: not < 12, checks < 16 -> 4 images
			(14 * 1024**3, 4),  # 14GB < 16GB -> 4 images
			(15.9 * 1024**3, 4),  # 15.9GB < 16GB -> 4 images
			(16 * 1024**3, 6),  # 16GB: not < 16, checks < inf -> 6 images
			(20 * 1024**3, 6),  # 20GB < inf -> 6 images
			(24 * 1024**3, 6),  # 24GB < inf -> 6 images
			(32 * 1024**3, 6),  # 32GB < inf -> 6 images
		],
	)
	def test_cuda_batch_size_based_on_memory(self, total_memory_bytes, expected_batch_size):
		with patch('app.services.device.torch') as mock_torch:
			mock_torch.cuda.is_available.return_value = True
			mock_torch.backends.mps.is_available.return_value = False
			mock_torch.float16 = 'float16'

			# Mock device properties
			props = SimpleNamespace(total_memory=total_memory_bytes)

			from app.services.device import DeviceService

			service = DeviceService()
			with patch.object(service, 'get_device_properties', return_value=props):
				result = service.get_recommended_batch_size()

			assert result == expected_batch_size

	def test_uses_batch_size_thresholds_constant(self):
		# Verify that the function uses the BATCH_SIZE_THRESHOLDS constant
		from app.constants.batch_size import BATCH_SIZE_THRESHOLDS

		with patch('app.services.device.torch') as mock_torch:
			mock_torch.cuda.is_available.return_value = True
			mock_torch.backends.mps.is_available.return_value = False
			mock_torch.float16 = 'float16'

			# Test with 11.63GB (should be tier 3: 8-12GB -> 3 images)
			props = SimpleNamespace(total_memory=11.63 * 1024**3)

			from app.services.device import DeviceService

			service = DeviceService()
			with patch.object(service, 'get_device_properties', return_value=props):
				result = service.get_recommended_batch_size()

			# Manually verify against thresholds
			total_memory_gb = props.total_memory / (1024**3)
			expected = None
			for memory_threshold, batch_size in BATCH_SIZE_THRESHOLDS:
				if total_memory_gb < memory_threshold:
					expected = batch_size
					break

			assert result == expected

	def test_fallback_to_largest_batch_when_exceeds_all_thresholds(self):
		with patch('app.services.device.torch') as mock_torch:
			mock_torch.cuda.is_available.return_value = True
			mock_torch.backends.mps.is_available.return_value = False
			mock_torch.float16 = 'float16'

			# Extremely large memory (100GB)
			props = SimpleNamespace(total_memory=100 * 1024**3)

			from app.services.device import DeviceService

			service = DeviceService()
			with patch.object(service, 'get_device_properties', return_value=props):
				result = service.get_recommended_batch_size()

			# Should return the largest batch size (6)
			assert result == 6
