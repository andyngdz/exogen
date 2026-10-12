"""Tests for lora_loader module."""

from unittest.mock import Mock, patch

import pytest

from app.schemas.generators import GeneratorConfig
from app.schemas.loras import LoRAConfigItem


@pytest.fixture
def sample_config_with_loras():
	"""Create a sample config with LoRAs."""
	return GeneratorConfig(
		prompt='test prompt',
		width=512,
		height=512,
		number_of_images=1,
		steps=20,
		loras=[
			LoRAConfigItem(lora_id=1, weight=0.8),
			LoRAConfigItem(lora_id=2, weight=0.6),
		],
	)


@pytest.fixture
def sample_config_without_loras():
	"""Create a sample config without LoRAs."""
	return GeneratorConfig(
		prompt='test prompt',
		width=512,
		height=512,
		number_of_images=1,
		steps=20,
		loras=[],
	)


@pytest.fixture
def mock_db():
	"""Create a mock database session."""
	return Mock()


class TestLoadLorasForGeneration:
	"""Test load_loras_for_generation() method."""

	@patch('app.cores.generation.lora_loader.model_manager')
	@patch('app.cores.generation.lora_loader.database_service')
	def test_returns_false_when_no_loras(self, mock_db_service, mock_model_manager, sample_config_without_loras, mock_db):
		"""Test that method returns False when config has no LoRAs."""
		from app.cores.generation.lora_loader import LoRALoader

		loader = LoRALoader()
		result = loader.load_loras_for_generation(sample_config_without_loras, mock_db)

		assert result is False
		mock_db_service.get_lora_by_id.assert_not_called()
		mock_model_manager.pipeline_manager.load_loras.assert_not_called()

	@patch('app.cores.generation.lora_loader.model_manager')
	@patch('app.cores.generation.lora_loader.database_service')
	def test_loads_loras_successfully(self, mock_db_service, mock_model_manager, sample_config_with_loras, mock_db):
		"""Test successful LoRA loading."""
		from app.cores.generation.lora_loader import LoRALoader

		# Setup
		mock_lora1 = Mock()
		mock_lora1.id = 1
		mock_lora1.name = 'lora1'
		mock_lora1.file_path = '/path/lora1.safetensors'

		mock_lora2 = Mock()
		mock_lora2.id = 2
		mock_lora2.name = 'lora2'
		mock_lora2.file_path = '/path/lora2.safetensors'

		mock_db_service.get_lora_by_id.side_effect = [mock_lora1, mock_lora2]
		loader = LoRALoader()

		# Execute
		result = loader.load_loras_for_generation(sample_config_with_loras, mock_db)

		# Verify
		assert result is True
		assert mock_db_service.get_lora_by_id.call_count == 2
		mock_model_manager.pipeline_manager.load_loras.assert_called_once()

		# Verify LoRA data
		call_args = mock_model_manager.pipeline_manager.load_loras.call_args[0][0]
		assert len(call_args) == 2
		assert call_args[0].id == 1
		assert call_args[0].weight == 0.8
		assert call_args[1].id == 2
		assert call_args[1].weight == 0.6

	@patch('app.cores.generation.lora_loader.database_service')
	def test_raises_when_lora_not_found(self, mock_db_service, sample_config_with_loras, mock_db):
		"""Test that ValueError is raised when LoRA is not found in database."""
		from app.cores.generation.lora_loader import LoRALoader

		# Setup - first LoRA exists, second doesn't
		mock_lora1 = Mock()
		mock_lora1.id = 1
		mock_lora1.name = 'lora1'
		mock_lora1.file_path = '/path/lora1.safetensors'

		mock_db_service.get_lora_by_id.side_effect = [mock_lora1, None]
		loader = LoRALoader()

		# Execute & Verify
		with pytest.raises(ValueError, match='LoRA with id 2 not found'):
			loader.load_loras_for_generation(sample_config_with_loras, mock_db)

	@patch('app.cores.generation.lora_loader.logger')
	@patch('app.cores.generation.lora_loader.model_manager')
	@patch('app.cores.generation.lora_loader.database_service')
	def test_logs_lora_loading(self, mock_db_service, mock_model_manager, mock_logger, sample_config_with_loras, mock_db):
		"""Test that LoRA loading is logged."""
		from app.cores.generation.lora_loader import LoRALoader

		# Setup
		mock_lora1 = Mock()
		mock_lora1.id = 1
		mock_lora1.name = 'lora1'
		mock_lora1.file_path = '/path/lora1.safetensors'

		mock_lora2 = Mock()
		mock_lora2.id = 2
		mock_lora2.name = 'lora2'
		mock_lora2.file_path = '/path/lora2.safetensors'

		mock_db_service.get_lora_by_id.side_effect = [mock_lora1, mock_lora2]
		loader = LoRALoader()

		# Execute
		loader.load_loras_for_generation(sample_config_with_loras, mock_db)

		# Verify
		mock_logger.info.assert_called_once_with('Loading 2 LoRAs for generation')


class TestUnloadLoras:
	"""Test unload_loras() method."""

	@patch('app.cores.generation.lora_loader.model_manager')
	def test_calls_pipeline_manager_unload(self, mock_model_manager):
		"""Test that pipeline_manager.unload_loras is called."""
		from app.cores.generation.lora_loader import LoRALoader

		loader = LoRALoader()
		loader.unload_loras()

		mock_model_manager.pipeline_manager.unload_loras.assert_called_once()

	@patch('app.cores.generation.lora_loader.logger')
	@patch('app.cores.generation.lora_loader.model_manager')
	def test_handles_unload_errors_gracefully(self, mock_model_manager, mock_logger):
		"""Test that unload errors are logged but not raised."""
		from app.cores.generation.lora_loader import LoRALoader

		# Setup
		mock_model_manager.pipeline_manager.unload_loras.side_effect = Exception('Unload failed')
		loader = LoRALoader()

		# Execute - should not raise
		loader.unload_loras()

		# Verify error was logged
		mock_logger.error.assert_called_once()
		assert 'Failed to unload LoRAs' in str(mock_logger.error.call_args)

	@patch('app.cores.generation.lora_loader.model_manager')
	def test_safe_to_call_multiple_times(self, mock_model_manager):
		"""Test that unload_loras can be called multiple times safely."""
		from app.cores.generation.lora_loader import LoRALoader

		loader = LoRALoader()

		# Execute multiple times
		loader.unload_loras()
		loader.unload_loras()
		loader.unload_loras()

		# Verify called 3 times
		assert mock_model_manager.pipeline_manager.unload_loras.call_count == 3


class TestLoRALoaderSingleton:
	"""Test lora_loader singleton."""

	def test_singleton_exists(self):
		"""Test that lora_loader singleton instance exists."""
		from app.cores.generation.lora_loader import lora_loader

		assert lora_loader is not None

	def test_singleton_has_required_methods(self):
		"""Test that singleton has required methods."""
		from app.cores.generation.lora_loader import lora_loader

		assert hasattr(lora_loader, 'load_loras_for_generation')
		assert hasattr(lora_loader, 'unload_loras')
		assert callable(lora_loader.load_loras_for_generation)
		assert callable(lora_loader.unload_loras)
