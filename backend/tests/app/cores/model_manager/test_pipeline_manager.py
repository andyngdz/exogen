"""Comprehensive tests for PipelineManager class.

This test suite covers:
1. Pipeline storage and retrieval (set_pipeline, get_pipeline, clear_pipeline)
2. Model ID management (get_model_id)
3. Sampler configuration (set_sampler) including Karras variants
4. Sample size retrieval (get_sample_size)
5. Error cases (no pipe loaded, unsupported sampler)
"""

from unittest.mock import MagicMock, patch

import pytest
from _pytest.logging import LogCaptureFixture

from app.cores.model_manager.pipeline_manager import PipelineManager
from app.cores.samplers import SamplerType


class TestPipelineStorage:
	"""Test pipeline storage and retrieval methods."""

	pipeline_manager: PipelineManager = PipelineManager()

	def setup_method(self) -> None:
		"""Create fresh PipelineManager for each test."""
		self.pipeline_manager = PipelineManager()

	def test_initial_pipeline_is_none(self):
		"""Test that pipeline is None on initialization."""
		assert self.pipeline_manager.get_pipeline() is None
		assert self.pipeline_manager.get_model_id() is None

	def test_set_pipeline_stores_pipe_and_model_id(self):
		"""Test set_pipeline stores both pipe and model_id."""
		mock_pipe = MagicMock()

		self.pipeline_manager.set_pipeline(mock_pipe, 'test/model')

		assert self.pipeline_manager.get_pipeline() == mock_pipe
		assert self.pipeline_manager.get_model_id() == 'test/model'

	def test_set_pipeline_logs_model_id(self, caplog: LogCaptureFixture) -> None:
		"""Test set_pipeline logs the model_id."""
		import logging

		caplog.set_level(logging.INFO)
		mock_pipe = MagicMock()

		self.pipeline_manager.set_pipeline(mock_pipe, 'my/model')

		assert 'Pipeline set for model: my/model' in caplog.text

	def test_clear_pipeline_resets_pipe_and_model_id(self):
		"""Test clear_pipeline sets pipe and model_id to None."""
		mock_pipe = MagicMock()
		self.pipeline_manager.set_pipeline(mock_pipe, 'test/model')

		self.pipeline_manager.clear_pipeline()

		assert self.pipeline_manager.get_pipeline() is None
		assert self.pipeline_manager.get_model_id() is None

	def test_clear_pipeline_logs_operation(self, caplog: LogCaptureFixture) -> None:
		"""Test clear_pipeline logs the operation."""
		import logging

		caplog.set_level(logging.INFO)
		mock_pipe = MagicMock()
		self.pipeline_manager.set_pipeline(mock_pipe, 'test/model')

		self.pipeline_manager.clear_pipeline()

		assert 'Pipeline cleared' in caplog.text

	def test_get_pipeline_returns_current_pipe(self):
		"""Test get_pipeline returns the current pipeline."""
		mock_pipe = MagicMock()
		self.pipeline_manager.pipe = mock_pipe

		result = self.pipeline_manager.get_pipeline()

		assert result == mock_pipe

	def test_get_model_id_returns_current_id(self):
		"""Test get_model_id returns the current model ID."""
		self.pipeline_manager.model_id = 'my/awesome/model'

		result = self.pipeline_manager.get_model_id()

		assert result == 'my/awesome/model'


class TestSetSampler:
	"""Test set_sampler() method with various sampler types."""

	pipeline_manager: PipelineManager = PipelineManager()

	def setup_method(self) -> None:
		"""Create fresh PipelineManager for each test."""
		self.pipeline_manager = PipelineManager()

	def test_set_sampler_raises_when_no_pipe_loaded(self):
		"""Test set_sampler raises ValueError when no pipe is loaded."""
		self.pipeline_manager.pipe = None

		with pytest.raises(ValueError, match='No model loaded'):
			self.pipeline_manager.set_sampler(SamplerType.EULER)

	def test_set_sampler_with_euler(self):
		"""Test set_sampler with EULER sampler."""
		# Setup
		mock_scheduler_config = {'key': 'value'}
		mock_scheduler = MagicMock()
		mock_scheduler.config = mock_scheduler_config

		mock_pipe = MagicMock()
		mock_pipe.scheduler = mock_scheduler

		self.pipeline_manager.pipe = mock_pipe

		# Mock SCHEDULER_MAPPING
		mock_new_scheduler_class = MagicMock()
		mock_new_scheduler_instance = MagicMock()
		mock_new_scheduler_class.from_config.return_value = mock_new_scheduler_instance

		with patch(
			'app.cores.model_manager.pipeline_manager.SCHEDULER_MAPPING', {SamplerType.EULER: mock_new_scheduler_class}
		):
			# Execute
			self.pipeline_manager.set_sampler(SamplerType.EULER)

			# Verify
			mock_new_scheduler_class.from_config.assert_called_once_with(mock_scheduler_config)
			assert self.pipeline_manager.pipe.scheduler == mock_new_scheduler_instance

	def test_set_sampler_with_karras_dpm_solver_multistep(self):
		"""Test set_sampler with DPM_SOLVER_MULTISTEP_KARRAS (Karras variant)."""
		# Setup
		mock_scheduler_config = {'key': 'value'}
		mock_scheduler = MagicMock()
		mock_scheduler.config = mock_scheduler_config

		mock_pipe = MagicMock()
		mock_pipe.scheduler = mock_scheduler

		self.pipeline_manager.pipe = mock_pipe

		# Mock SCHEDULER_MAPPING
		mock_new_scheduler_class = MagicMock()
		mock_new_scheduler_instance = MagicMock()
		mock_new_scheduler_class.from_config.return_value = mock_new_scheduler_instance

		with patch(
			'app.cores.model_manager.pipeline_manager.SCHEDULER_MAPPING',
			{SamplerType.DPM_SOLVER_MULTISTEP_KARRAS: mock_new_scheduler_class},
		):
			# Execute
			self.pipeline_manager.set_sampler(SamplerType.DPM_SOLVER_MULTISTEP_KARRAS)

			# Verify use_karras_sigmas=True was passed
			mock_new_scheduler_class.from_config.assert_called_once_with(mock_scheduler_config, use_karras_sigmas=True)
			assert self.pipeline_manager.pipe.scheduler == mock_new_scheduler_instance

	def test_set_sampler_with_karras_dpm_solver_sde(self):
		"""Test set_sampler with DPM_SOLVER_SDE_KARRAS (Karras variant)."""
		# Setup
		mock_scheduler_config = {'key': 'value'}
		mock_scheduler = MagicMock()
		mock_scheduler.config = mock_scheduler_config

		mock_pipe = MagicMock()
		mock_pipe.scheduler = mock_scheduler

		self.pipeline_manager.pipe = mock_pipe

		# Mock SCHEDULER_MAPPING
		mock_new_scheduler_class = MagicMock()
		mock_new_scheduler_instance = MagicMock()
		mock_new_scheduler_class.from_config.return_value = mock_new_scheduler_instance

		with patch(
			'app.cores.model_manager.pipeline_manager.SCHEDULER_MAPPING',
			{SamplerType.DPM_SOLVER_SDE_KARRAS: mock_new_scheduler_class},
		):
			# Execute
			self.pipeline_manager.set_sampler(SamplerType.DPM_SOLVER_SDE_KARRAS)

			# Verify use_karras_sigmas=True was passed
			mock_new_scheduler_class.from_config.assert_called_once_with(mock_scheduler_config, use_karras_sigmas=True)

	def test_set_sampler_raises_for_unsupported_sampler(self):
		"""Test set_sampler raises ValueError for unsupported sampler."""
		# Setup
		mock_pipe = MagicMock()
		mock_pipe.scheduler.config = {}
		self.pipeline_manager.pipe = mock_pipe

		# Mock SCHEDULER_MAPPING to be empty (no samplers)
		with patch('app.cores.model_manager.pipeline_manager.SCHEDULER_MAPPING', {}):
			with pytest.raises(ValueError, match='Unsupported sampler type'):
				self.pipeline_manager.set_sampler(SamplerType.EULER)

	def test_set_sampler_logs_sampler_change(self, caplog: LogCaptureFixture) -> None:
		"""Test set_sampler logs the sampler change."""
		import logging

		caplog.set_level(logging.INFO)

		# Setup
		mock_scheduler_config = {'key': 'value'}
		mock_scheduler = MagicMock()
		mock_scheduler.config = mock_scheduler_config

		mock_pipe = MagicMock()
		mock_pipe.scheduler = mock_scheduler

		self.pipeline_manager.pipe = mock_pipe

		# Mock SCHEDULER_MAPPING
		mock_new_scheduler_class = MagicMock()
		mock_new_scheduler_instance = MagicMock()
		mock_new_scheduler_class.from_config.return_value = mock_new_scheduler_instance

		with patch(
			'app.cores.model_manager.pipeline_manager.SCHEDULER_MAPPING', {SamplerType.EULER: mock_new_scheduler_class}
		):
			# Execute
			self.pipeline_manager.set_sampler(SamplerType.EULER)

			# Verify logging (SamplerType.EULER.value is uppercase "EULER")
			assert 'Sampler set to: EULER' in caplog.text


class TestGetSampleSize:
	"""Test get_sample_size() method."""

	pipeline_manager: PipelineManager = PipelineManager()

	def setup_method(self) -> None:
		"""Create fresh PipelineManager for each test."""
		self.pipeline_manager = PipelineManager()

	def test_get_sample_size_raises_when_no_pipe_loaded(self):
		"""Test get_sample_size raises ValueError when no pipe is loaded."""
		self.pipeline_manager.pipe = None

		with pytest.raises(ValueError, match='No model loaded'):
			self.pipeline_manager.get_sample_size()

	def test_get_sample_size_returns_unet_sample_size(self):
		"""Test get_sample_size returns sample_size from UNet config."""
		# Setup
		mock_unet_config = MagicMock()
		mock_unet_config.sample_size = 64

		mock_pipe = MagicMock()
		mock_pipe.unet.config = mock_unet_config

		self.pipeline_manager.pipe = mock_pipe

		# Execute
		result = self.pipeline_manager.get_sample_size()

		# Verify
		assert result == 64

	def test_get_sample_size_returns_default_when_no_sample_size_attribute(self):
		"""Test get_sample_size returns DEFAULT_SAMPLE_SIZE when sample_size not in config."""
		from app.constants.samplers import DEFAULT_SAMPLE_SIZE

		# Setup - config without sample_size attribute
		mock_unet_config = MagicMock(spec_set=['other_attr'])

		mock_pipe = MagicMock()
		mock_pipe.unet.config = mock_unet_config

		self.pipeline_manager.pipe = mock_pipe

		# Execute
		result = self.pipeline_manager.get_sample_size()

		# Verify
		assert result == DEFAULT_SAMPLE_SIZE

	def test_get_sample_size_with_different_sample_sizes(self):
		"""Test get_sample_size with various sample size values."""
		# Test with sample_size=32
		mock_unet_config_32 = MagicMock()
		mock_unet_config_32.sample_size = 32

		mock_pipe = MagicMock()
		mock_pipe.unet.config = mock_unet_config_32

		self.pipeline_manager.pipe = mock_pipe

		assert self.pipeline_manager.get_sample_size() == 32

		# Test with sample_size=128
		mock_unet_config_128 = MagicMock()
		mock_unet_config_128.sample_size = 128

		mock_pipe.unet.config = mock_unet_config_128

		assert self.pipeline_manager.get_sample_size() == 128


class TestPipelineManagerEdgeCases:
	"""Test edge cases and state consistency."""

	pipeline_manager: PipelineManager = PipelineManager()

	def setup_method(self) -> None:
		"""Create fresh PipelineManager for each test."""
		self.pipeline_manager = PipelineManager()

	def test_set_pipeline_can_overwrite_existing_pipeline(self):
		"""Test set_pipeline can replace an existing pipeline."""
		old_pipe = MagicMock()
		new_pipe = MagicMock()

		self.pipeline_manager.set_pipeline(old_pipe, 'old/model')
		self.pipeline_manager.set_pipeline(new_pipe, 'new/model')

		assert self.pipeline_manager.get_pipeline() == new_pipe
		assert self.pipeline_manager.get_model_id() == 'new/model'

	def test_clear_pipeline_is_idempotent(self):
		"""Test clear_pipeline can be called multiple times safely."""
		mock_pipe = MagicMock()
		self.pipeline_manager.set_pipeline(mock_pipe, 'test/model')

		self.pipeline_manager.clear_pipeline()
		self.pipeline_manager.clear_pipeline()  # Call again

		assert self.pipeline_manager.get_pipeline() is None
		assert self.pipeline_manager.get_model_id() is None


class TestLoadLoRAs:
	"""Test load_loras() method for LoRA management."""

	pipeline_manager: PipelineManager = PipelineManager()

	def setup_method(self) -> None:
		"""Create fresh PipelineManager for each test."""
		self.pipeline_manager = PipelineManager()

	def test_load_loras_raises_when_no_pipe_loaded(self):
		"""Test load_loras raises ValueError when no pipe is loaded."""
		from app.schemas.loras import LoRAData

		self.pipeline_manager.pipe = None

		lora_configs = [LoRAData(id=1, name='test', file_path='/path/test.safetensors', weight=1.0)]

		with pytest.raises(ValueError, match='No model loaded'):
			self.pipeline_manager.load_loras(lora_configs)

	def test_load_loras_with_empty_list(self, caplog: LogCaptureFixture) -> None:
		"""Test load_loras handles empty config list gracefully."""
		import logging

		caplog.set_level(logging.WARNING)

		mock_pipe = MagicMock()
		self.pipeline_manager.pipe = mock_pipe

		self.pipeline_manager.load_loras([])

		assert 'load_loras called with empty config list' in caplog.text
		mock_pipe.load_lora_weights.assert_not_called()

	def test_load_loras_single_lora(self, caplog: LogCaptureFixture) -> None:
		"""Test load_loras with a single LoRA."""
		import logging

		from app.schemas.loras import LoRAData

		caplog.set_level(logging.INFO)

		mock_pipe = MagicMock()
		self.pipeline_manager.pipe = mock_pipe

		lora_config = LoRAData(id=1, name='style_lora', file_path='/cache/loras/style.safetensors', weight=0.8)

		self.pipeline_manager.load_loras([lora_config])

		# Verify load_lora_weights called with correct parameters (directory + weight_name)
		mock_pipe.load_lora_weights.assert_called_once_with(
			'/cache/loras', weight_name='style.safetensors', adapter_name='lora_1'
		)

		# Verify set_adapters called with correct parameters
		mock_pipe.set_adapters.assert_called_once_with(['lora_1'], adapter_weights=[0.8])

		# Verify logging
		assert "Loading LoRA 'style_lora' as adapter 'lora_1' (weight: 0.8)" in caplog.text
		assert 'Successfully activated 1 compatible LoRAs' in caplog.text

	def test_load_loras_multiple_loras(self):
		"""Test load_loras with multiple LoRAs."""
		from app.schemas.loras import LoRAData

		mock_pipe = MagicMock()
		self.pipeline_manager.pipe = mock_pipe

		lora_configs = [
			LoRAData(id=1, name='lora1', file_path='/cache/loras/lora1.safetensors', weight=0.7),
			LoRAData(id=2, name='lora2', file_path='/cache/loras/lora2.safetensors', weight=1.0),
			LoRAData(id=3, name='lora3', file_path='/cache/loras/lora3.safetensors', weight=0.5),
		]

		self.pipeline_manager.load_loras(lora_configs)

		# Verify load_lora_weights called 3 times
		assert mock_pipe.load_lora_weights.call_count == 3

		# Verify adapter names use database IDs
		calls = mock_pipe.load_lora_weights.call_args_list
		assert calls[0][1]['adapter_name'] == 'lora_1'
		assert calls[1][1]['adapter_name'] == 'lora_2'
		assert calls[2][1]['adapter_name'] == 'lora_3'

		# Verify set_adapters called with all adapters and weights
		mock_pipe.set_adapters.assert_called_once_with(['lora_1', 'lora_2', 'lora_3'], adapter_weights=[0.7, 1.0, 0.5])

	def test_load_loras_with_different_weights(self):
		"""Test load_loras handles various weight values."""
		from app.schemas.loras import LoRAData

		mock_pipe = MagicMock()
		self.pipeline_manager.pipe = mock_pipe

		lora_configs = [
			LoRAData(id=10, name='min', file_path='/cache/loras/min.safetensors', weight=0.0),
			LoRAData(id=20, name='max', file_path='/cache/loras/max.safetensors', weight=2.0),
			LoRAData(id=30, name='mid', file_path='/cache/loras/mid.safetensors', weight=1.0),
		]

		self.pipeline_manager.load_loras(lora_configs)

		mock_pipe.set_adapters.assert_called_once_with(['lora_10', 'lora_20', 'lora_30'], adapter_weights=[0.0, 2.0, 1.0])

	def test_load_loras_handles_loading_failure(self, caplog: LogCaptureFixture) -> None:
		"""Test load_loras raises ValueError when all LoRAs fail to load."""
		import logging

		from app.schemas.loras import LoRAData

		caplog.set_level(logging.ERROR)

		mock_pipe = MagicMock()
		mock_pipe.load_lora_weights.side_effect = Exception('File not found')
		self.pipeline_manager.pipe = mock_pipe

		lora_config = LoRAData(id=1, name='broken', file_path='/cache/loras/broken.safetensors', weight=1.0)

		with pytest.raises(ValueError, match='All 1 LoRAs failed to load'):
			self.pipeline_manager.load_loras([lora_config])

		assert 'All 1 LoRAs failed to load' in caplog.text

	def test_load_loras_partial_failure(self, caplog: LogCaptureFixture) -> None:
		"""Test load_loras skips incompatible LoRAs and continues with compatible ones."""
		import logging

		from app.schemas.loras import LoRAData

		caplog.set_level(logging.WARNING)

		mock_pipe = MagicMock()

		# Second LoRA fails (incompatible), others succeed
		def side_effect(path: str, weight_name: str, adapter_name: str) -> None:
			if 'lora2' in weight_name:
				raise Exception('size mismatch for down_blocks.1.attentions.0.proj_in.lora_A')

		mock_pipe.load_lora_weights.side_effect = side_effect
		self.pipeline_manager.pipe = mock_pipe

		lora_configs = [
			LoRAData(id=1, name='lora1', file_path='/cache/loras/lora1.safetensors', weight=0.8),
			LoRAData(id=2, name='lora2', file_path='/cache/loras/lora2.safetensors', weight=1.0),
			LoRAData(id=3, name='lora3', file_path='/cache/loras/lora3.safetensors', weight=0.5),
		]

		# Should not raise - incompatible LoRAs are skipped
		self.pipeline_manager.load_loras(lora_configs)

		# Verify only compatible LoRAs (lora1 and lora3) are activated
		mock_pipe.set_adapters.assert_called_once_with(['lora_1', 'lora_3'], adapter_weights=[0.8, 0.5])

		# Verify warning about incompatible LoRA
		assert 'Skipping LoRA' in caplog.text
		assert 'incompatible with current model architecture' in caplog.text


class TestUnloadLoRAs:
	"""Test unload_loras() method."""

	pipeline_manager: PipelineManager = PipelineManager()

	def setup_method(self) -> None:
		"""Create fresh PipelineManager for each test."""
		self.pipeline_manager = PipelineManager()

	def test_unload_loras_raises_when_no_pipe_loaded(self):
		"""Test unload_loras raises ValueError when no pipe is loaded."""
		self.pipeline_manager.pipe = None

		with pytest.raises(ValueError, match='No model loaded'):
			self.pipeline_manager.unload_loras()

	def test_unload_loras_success(self, caplog: LogCaptureFixture) -> None:
		"""Test successful LoRA unloading."""
		import logging

		caplog.set_level(logging.INFO)

		mock_pipe = MagicMock()
		self.pipeline_manager.pipe = mock_pipe

		self.pipeline_manager.unload_loras()

		mock_pipe.unload_lora_weights.assert_called_once()
		assert 'Unloaded all LoRAs' in caplog.text

	def test_unload_loras_handles_failure(self, caplog: LogCaptureFixture) -> None:
		"""Test unload_loras raises ValueError when unloading fails."""
		import logging

		caplog.set_level(logging.ERROR)

		mock_pipe = MagicMock()
		mock_pipe.unload_lora_weights.side_effect = Exception('Unload failed')
		self.pipeline_manager.pipe = mock_pipe

		with pytest.raises(ValueError, match='Failed to unload LoRAs'):
			self.pipeline_manager.unload_loras()

		assert 'Failed to unload LoRAs' in caplog.text

	def test_unload_loras_is_idempotent(self):
		"""Test unload_loras can be called multiple times."""
		mock_pipe = MagicMock()
		self.pipeline_manager.pipe = mock_pipe

		self.pipeline_manager.unload_loras()
		self.pipeline_manager.unload_loras()

		assert mock_pipe.unload_lora_weights.call_count == 2
