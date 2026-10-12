"""Tests for app/features/config/api.py

Covers:
- GET /config endpoint returns ConfigResponse
- Response includes upscalers sections grouped by method
- Safety check toggle endpoint
- Memory scale factors in config response
- Total memory info in config response
- Device index in config response
- Device selection endpoint
- Max memory configuration endpoint
"""

from unittest.mock import MagicMock, patch

from app.features.config.api import get_config, update_device, update_max_memory, update_safety_check
from app.schemas.config import (
	ConfigResponse,
	DeviceRequest,
	MaxMemoryRequest,
	SafetyCheckRequest,
	UpscalerItem,
	UpscalerSection,
	UpscalingMethod,
)


def create_mock_config_response(
	safety_check_enabled: bool = True,
	gpu_scale_factor: float = 0.5,
	ram_scale_factor: float = 0.5,
	total_gpu_memory: int = 8589934592,
	total_ram_memory: int = 17179869184,
	device_index: int = 0,
) -> ConfigResponse:
	"""Create a mock ConfigResponse with default or custom values."""
	return ConfigResponse(
		upscalers=[
			UpscalerSection(
				method=UpscalingMethod.TRADITIONAL,
				title='Traditional',
				options=[
					UpscalerItem(
						value='Lanczos',
						name='Lanczos (High Quality)',
						description='High-quality resampling',
						suggested_denoise_strength=0.4,
						method=UpscalingMethod.TRADITIONAL,
						is_recommended=False,
					)
				],
			)
		],
		safety_check_enabled=safety_check_enabled,
		gpu_scale_factor=gpu_scale_factor,
		ram_scale_factor=ram_scale_factor,
		total_gpu_memory=total_gpu_memory,
		total_ram_memory=total_ram_memory,
		device_index=device_index,
	)


class TestConfigAPI:
	"""Test config API endpoints."""

	@patch('app.features.config.api.config_service')
	def test_get_config_returns_config_response(self, mock_config_service):
		"""Test that get_config returns a ConfigResponse."""
		mock_config_service.get_config.return_value = create_mock_config_response()
		mock_db = MagicMock()

		result = get_config(mock_db)

		assert isinstance(result, ConfigResponse)
		mock_config_service.get_config.assert_called_once_with(mock_db)

	@patch('app.features.config.api.config_service')
	def test_get_config_includes_upscalers_sections(self, mock_config_service):
		"""Test that get_config response includes upscalers sections."""
		mock_config_service.get_config.return_value = create_mock_config_response()
		mock_db = MagicMock()

		result = get_config(mock_db)

		assert hasattr(result, 'upscalers')
		assert isinstance(result.upscalers, list)
		assert len(result.upscalers) > 0

	@patch('app.features.config.api.config_service')
	def test_get_config_upscalers_are_upscaler_sections(self, mock_config_service):
		"""Test that upscalers in response are UpscalerSection instances."""
		mock_config_service.get_config.return_value = create_mock_config_response()
		mock_db = MagicMock()

		result = get_config(mock_db)

		assert all(isinstance(section, UpscalerSection) for section in result.upscalers)

	@patch('app.features.config.api.config_service')
	def test_get_config_sections_have_options(self, mock_config_service):
		"""Test that each section has options that are UpscalerItem instances."""
		mock_config_service.get_config.return_value = create_mock_config_response()
		mock_db = MagicMock()

		result = get_config(mock_db)

		for section in result.upscalers:
			assert hasattr(section, 'options')
			assert isinstance(section.options, list)
			assert all(isinstance(item, UpscalerItem) for item in section.options)


class TestSafetyCheckAPI:
	"""Test safety check toggle API endpoints."""

	@patch('app.features.config.api.config_service')
	def test_get_config_includes_safety_check_enabled(self, mock_config_service):
		"""Test that get_config returns safety_check_enabled field."""
		mock_config_service.get_config.return_value = create_mock_config_response(safety_check_enabled=True)
		mock_db = MagicMock()

		result = get_config(mock_db)

		assert hasattr(result, 'safety_check_enabled')
		assert result.safety_check_enabled is True

	@patch('app.features.config.api.config_service')
	def test_get_config_returns_safety_check_disabled(self, mock_config_service):
		"""Test that get_config returns safety_check_enabled=False when disabled."""
		mock_config_service.get_config.return_value = create_mock_config_response(safety_check_enabled=False)
		mock_db = MagicMock()

		result = get_config(mock_db)

		assert result.safety_check_enabled is False

	@patch('app.features.config.api.config_service')
	@patch('app.features.config.api.config_crud')
	def test_update_safety_check_enables(self, mock_config_crud, mock_config_service):
		"""Test enabling safety check via PUT endpoint."""
		mock_config_service.get_config.return_value = create_mock_config_response(safety_check_enabled=True)
		mock_db = MagicMock()
		request = SafetyCheckRequest(enabled=True)

		result = update_safety_check(request, mock_db)

		mock_config_crud.set_safety_check_enabled.assert_called_once_with(mock_db, True)
		assert result.safety_check_enabled is True

	@patch('app.features.config.api.config_service')
	@patch('app.features.config.api.config_crud')
	def test_update_safety_check_disables(self, mock_config_crud, mock_config_service):
		"""Test disabling safety check via PUT endpoint."""
		mock_config_service.get_config.return_value = create_mock_config_response(safety_check_enabled=False)
		mock_db = MagicMock()
		request = SafetyCheckRequest(enabled=False)

		result = update_safety_check(request, mock_db)

		mock_config_crud.set_safety_check_enabled.assert_called_once_with(mock_db, False)
		assert result.safety_check_enabled is False


class TestMemoryScaleFactorsAPI:
	"""Test memory scale factors in config response."""

	@patch('app.features.config.api.config_service')
	def test_get_config_returns_default_scale_factors(self, mock_config_service):
		"""Test that get_config returns default scale factors (0.5)."""
		mock_config_service.get_config.return_value = create_mock_config_response(
			gpu_scale_factor=0.5, ram_scale_factor=0.5
		)
		mock_db = MagicMock()

		result = get_config(mock_db)

		assert result.gpu_scale_factor == 0.5
		assert result.ram_scale_factor == 0.5

	@patch('app.features.config.api.config_service')
	def test_get_config_returns_custom_scale_factors(self, mock_config_service):
		"""Test that get_config returns custom scale factors."""
		mock_config_service.get_config.return_value = create_mock_config_response(
			gpu_scale_factor=0.8, ram_scale_factor=0.7
		)
		mock_db = MagicMock()

		result = get_config(mock_db)

		assert result.gpu_scale_factor == 0.8
		assert result.ram_scale_factor == 0.7

	@patch('app.features.config.api.config_service')
	@patch('app.features.config.api.config_crud')
	def test_update_safety_check_includes_scale_factors(self, mock_config_crud, mock_config_service):
		"""Test that update_safety_check response includes scale factors."""
		mock_config_service.get_config.return_value = create_mock_config_response(
			gpu_scale_factor=0.6, ram_scale_factor=0.4
		)
		mock_db = MagicMock()
		request = SafetyCheckRequest(enabled=True)

		result = update_safety_check(request, mock_db)

		assert result.gpu_scale_factor == 0.6
		assert result.ram_scale_factor == 0.4


class TestTotalMemoryAPI:
	"""Test total memory info in config response."""

	@patch('app.features.config.api.config_service')
	def test_get_config_returns_total_memory(self, mock_config_service):
		"""Test that get_config returns total GPU and RAM memory."""
		mock_config_service.get_config.return_value = create_mock_config_response(
			total_gpu_memory=8589934592, total_ram_memory=17179869184
		)
		mock_db = MagicMock()

		result = get_config(mock_db)

		assert result.total_gpu_memory == 8589934592  # 8GB
		assert result.total_ram_memory == 17179869184  # 16GB

	@patch('app.features.config.api.config_service')
	def test_get_config_returns_custom_memory_values(self, mock_config_service):
		"""Test that get_config returns actual memory values from system."""
		mock_config_service.get_config.return_value = create_mock_config_response(
			total_gpu_memory=12884901888, total_ram_memory=34359738368
		)
		mock_db = MagicMock()

		result = get_config(mock_db)

		assert result.total_gpu_memory == 12884901888
		assert result.total_ram_memory == 34359738368

	@patch('app.features.config.api.config_service')
	@patch('app.features.config.api.config_crud')
	def test_update_safety_check_includes_total_memory(self, mock_config_crud, mock_config_service):
		"""Test that update_safety_check response includes total memory."""
		mock_config_service.get_config.return_value = create_mock_config_response(
			total_gpu_memory=8589934592, total_ram_memory=17179869184
		)
		mock_db = MagicMock()
		request = SafetyCheckRequest(enabled=True)

		result = update_safety_check(request, mock_db)

		assert result.total_gpu_memory == 8589934592
		assert result.total_ram_memory == 17179869184


class TestDeviceIndexAPI:
	"""Test device index in config response."""

	@patch('app.features.config.api.config_service')
	def test_get_config_returns_device_index(self, mock_config_service):
		"""Test that get_config returns device_index field."""
		mock_config_service.get_config.return_value = create_mock_config_response(device_index=0)
		mock_db = MagicMock()

		result = get_config(mock_db)

		assert hasattr(result, 'device_index')
		assert result.device_index == 0

	@patch('app.features.config.api.config_service')
	def test_get_config_returns_cpu_mode_device_index(self, mock_config_service):
		"""Test that get_config returns device_index=-1 for CPU mode."""
		mock_config_service.get_config.return_value = create_mock_config_response(device_index=-1)
		mock_db = MagicMock()

		result = get_config(mock_db)

		assert result.device_index == -1

	@patch('app.features.config.api.config_service')
	def test_update_device_sets_device_index(self, mock_config_service):
		"""Test that update_device sets the device index."""
		mock_config_service.set_device.return_value = create_mock_config_response(device_index=1)
		mock_db = MagicMock()
		request = DeviceRequest(device_index=1)

		result = update_device(request, mock_db)

		mock_config_service.set_device.assert_called_once_with(mock_db, 1)
		assert result.device_index == 1

	@patch('app.features.config.api.config_service')
	def test_update_device_sets_cpu_mode(self, mock_config_service):
		"""Test that update_device can set CPU mode (-1)."""
		mock_config_service.set_device.return_value = create_mock_config_response(device_index=-1)
		mock_db = MagicMock()
		request = DeviceRequest(device_index=-1)

		result = update_device(request, mock_db)

		mock_config_service.set_device.assert_called_once_with(mock_db, -1)
		assert result.device_index == -1


class TestMaxMemoryAPI:
	"""Test max memory configuration endpoint."""

	@patch('app.features.config.api.config_service')
	def test_update_max_memory_sets_scale_factors(self, mock_config_service):
		"""Test that update_max_memory sets scale factors."""
		mock_config_service.set_max_memory.return_value = create_mock_config_response(
			gpu_scale_factor=0.8, ram_scale_factor=0.7
		)
		mock_db = MagicMock()
		request = MaxMemoryRequest(gpu_scale_factor=0.8, ram_scale_factor=0.7)

		result = update_max_memory(request, mock_db)

		mock_config_service.set_max_memory.assert_called_once_with(mock_db, 0.8, 0.7)
		assert result.gpu_scale_factor == 0.8
		assert result.ram_scale_factor == 0.7

	@patch('app.features.config.api.config_service')
	def test_update_max_memory_returns_config_response(self, mock_config_service):
		"""Test that update_max_memory returns ConfigResponse."""
		mock_config_service.set_max_memory.return_value = create_mock_config_response()
		mock_db = MagicMock()
		request = MaxMemoryRequest(gpu_scale_factor=0.5, ram_scale_factor=0.5)

		result = update_max_memory(request, mock_db)

		assert isinstance(result, ConfigResponse)
