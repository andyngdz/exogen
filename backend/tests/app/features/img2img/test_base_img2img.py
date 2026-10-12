"""Tests for base_img2img module."""

import asyncio
from concurrent.futures import ThreadPoolExecutor
from unittest.mock import Mock, PropertyMock, patch

import pytest
from PIL import Image

from app.schemas.hires_fix import HiresFixConfig, UpscalerType
from app.schemas.img2img import Img2ImgConfig


def create_mock_run_in_executor(mock_output: Mock):
	"""Create a mock for run_in_executor that properly returns a future."""

	def mock_run_in_executor(executor, func):
		future: asyncio.Future[Mock] = asyncio.Future()
		future.set_result(func())
		return future

	return mock_run_in_executor


@pytest.fixture
def sample_config():
	"""Create a sample img2img config."""
	return Img2ImgConfig(
		init_image='data:image/png;base64,iVBORw0KGgo=',
		strength=0.75,
		prompt='test prompt',
		negative_prompt='bad quality',
		width=512,
		height=512,
		number_of_images=1,
		steps=20,
		cfg_scale=7.5,
		seed=42,
		clip_skip=1,
	)


@pytest.fixture
def mock_executor():
	"""Create a mock executor."""
	return Mock(spec=ThreadPoolExecutor)


@pytest.fixture
def sample_init_image():
	"""Create a sample init image."""
	return Image.new('RGB', (512, 512), color='blue')


class TestExecutePipeline:
	"""Test execute_pipeline() method."""

	@pytest.mark.asyncio
	@patch('app.features.img2img.base_img2img.seed_manager')
	@patch('app.features.img2img.base_img2img.progress_callback')
	@patch('app.features.img2img.base_img2img.model_manager')
	@patch('app.features.img2img.base_img2img.pipeline_converter')
	async def test_validates_model_is_loaded(
		self,
		mock_pipeline_converter,
		mock_model_manager,
		mock_progress_callback,
		mock_seed_manager,
		sample_config,
		mock_executor,
		sample_init_image,
	):
		"""Test that ValueError is raised if model is None."""
		from app.features.img2img.base_img2img import BaseImg2Img

		type(mock_model_manager).pipe = PropertyMock(side_effect=ValueError('No model is currently loaded'))
		generator = BaseImg2Img(mock_executor)

		with pytest.raises(ValueError, match='No model is currently loaded'):
			await generator.execute_pipeline(sample_config, 'positive', 'negative', sample_init_image)

	@pytest.mark.asyncio
	@patch('app.features.img2img.base_img2img.safety_checker_service')
	@patch('app.features.img2img.base_img2img.Img2ImgPhaseTracker')
	@patch('app.features.img2img.base_img2img.torch.Generator')
	@patch('app.features.img2img.base_img2img.seed_manager')
	@patch('app.features.img2img.base_img2img.progress_callback')
	@patch('app.features.img2img.base_img2img.model_manager')
	@patch('app.features.img2img.base_img2img.pipeline_converter')
	async def test_converts_pipeline_to_img2img(
		self,
		mock_pipeline_converter,
		mock_model_manager,
		mock_progress_callback,
		mock_seed_manager,
		mock_torch_generator,
		mock_phase_tracker_class,
		mock_safety_checker_service,
		sample_config,
		mock_executor,
		sample_init_image,
	):
		"""Test that pipeline is converted to img2img mode."""
		from app.features.img2img.base_img2img import BaseImg2Img

		mock_pipe = Mock()
		mock_pipe.device = 'cuda'
		mock_img2img_pipe = Mock()
		mock_img2img_pipe.device = 'cuda'
		mock_model_manager.pipe = mock_pipe
		mock_pipeline_converter.convert_to_img2img.return_value = mock_img2img_pipe
		mock_seed_manager.get_seed.return_value = 12345
		mock_torch_generator.return_value.manual_seed.return_value = Mock()

		mock_output = Mock()
		mock_output.images = [Image.new('RGB', (512, 512))]
		mock_img2img_pipe.return_value = mock_output
		mock_safety_checker_service.check_images.return_value = ([Mock()], [False])

		generator = BaseImg2Img(mock_executor)

		with patch('asyncio.get_event_loop') as mock_loop:
			mock_loop.return_value.run_in_executor = create_mock_run_in_executor(mock_output)
			await generator.execute_pipeline(sample_config, 'positive', 'negative', sample_init_image)

		mock_pipeline_converter.convert_to_img2img.assert_called_once_with(mock_pipe)

	@pytest.mark.asyncio
	@patch('app.features.img2img.base_img2img.safety_checker_service')
	@patch('app.features.img2img.base_img2img.Img2ImgPhaseTracker')
	@patch('app.features.img2img.base_img2img.torch.Generator')
	@patch('app.features.img2img.base_img2img.seed_manager')
	@patch('app.features.img2img.base_img2img.progress_callback')
	@patch('app.features.img2img.base_img2img.model_manager')
	@patch('app.features.img2img.base_img2img.pipeline_converter')
	async def test_sets_sampler(
		self,
		mock_pipeline_converter,
		mock_model_manager,
		mock_progress_callback,
		mock_seed_manager,
		mock_torch_generator,
		mock_phase_tracker_class,
		mock_safety_checker_service,
		sample_config,
		mock_executor,
		sample_init_image,
	):
		"""Test that sampler is set before generation."""
		from app.features.img2img.base_img2img import BaseImg2Img

		mock_pipe = Mock()
		mock_pipe.device = 'cuda'
		mock_img2img_pipe = Mock()
		mock_img2img_pipe.device = 'cuda'
		mock_model_manager.pipe = mock_pipe
		mock_pipeline_converter.convert_to_img2img.return_value = mock_img2img_pipe
		mock_seed_manager.get_seed.return_value = 12345
		mock_torch_generator.return_value.manual_seed.return_value = Mock()

		mock_output = Mock()
		mock_output.images = [Image.new('RGB', (512, 512))]
		mock_img2img_pipe.return_value = mock_output
		mock_safety_checker_service.check_images.return_value = ([Mock()], [False])

		generator = BaseImg2Img(mock_executor)

		with patch('asyncio.get_event_loop') as mock_loop:
			mock_loop.return_value.run_in_executor = create_mock_run_in_executor(mock_output)
			await generator.execute_pipeline(sample_config, 'positive', 'negative', sample_init_image)

		mock_model_manager.set_sampler.assert_called_once_with(sample_config.sampler)

	@pytest.mark.asyncio
	@patch('app.features.img2img.base_img2img.safety_checker_service')
	@patch('app.features.img2img.base_img2img.Img2ImgPhaseTracker')
	@patch('app.features.img2img.base_img2img.torch.Generator')
	@patch('app.features.img2img.base_img2img.seed_manager')
	@patch('app.features.img2img.base_img2img.progress_callback')
	@patch('app.features.img2img.base_img2img.model_manager')
	@patch('app.features.img2img.base_img2img.pipeline_converter')
	async def test_calls_safety_checker(
		self,
		mock_pipeline_converter,
		mock_model_manager,
		mock_progress_callback,
		mock_seed_manager,
		mock_torch_generator,
		mock_phase_tracker_class,
		mock_safety_checker_service,
		sample_config,
		mock_executor,
		sample_init_image,
	):
		"""Test that safety checker is called on generated images."""
		from app.features.img2img.base_img2img import BaseImg2Img

		mock_pipe = Mock()
		mock_pipe.device = 'cuda'
		mock_img2img_pipe = Mock()
		mock_img2img_pipe.device = 'cuda'
		mock_model_manager.pipe = mock_pipe
		mock_pipeline_converter.convert_to_img2img.return_value = mock_img2img_pipe
		mock_seed_manager.get_seed.return_value = 12345
		mock_torch_generator.return_value.manual_seed.return_value = Mock()

		generated_image = Image.new('RGB', (512, 512))
		mock_output = Mock()
		mock_output.images = [generated_image]
		mock_img2img_pipe.return_value = mock_output
		mock_safety_checker_service.check_images.return_value = ([generated_image], [False])

		generator = BaseImg2Img(mock_executor)

		with patch('asyncio.get_event_loop') as mock_loop:
			mock_loop.return_value.run_in_executor = create_mock_run_in_executor(mock_output)
			await generator.execute_pipeline(sample_config, 'positive', 'negative', sample_init_image)

		mock_safety_checker_service.check_images.assert_called_once()


class TestBaseImg2ImgInit:
	"""Test BaseImg2Img initialization."""

	def test_initializes_with_executor(self, mock_executor):
		"""Test that generator initializes with executor."""
		from app.features.img2img.base_img2img import BaseImg2Img

		generator = BaseImg2Img(mock_executor)

		assert generator.executor == mock_executor

	def test_executor_is_stored(self):
		"""Test that executor is properly stored."""
		from app.features.img2img.base_img2img import BaseImg2Img

		executor = ThreadPoolExecutor(max_workers=1)
		generator = BaseImg2Img(executor)

		assert isinstance(generator.executor, ThreadPoolExecutor)
		executor.shutdown(wait=False)


class TestPhaseTrackerIntegration:
	"""Test phase tracker integration in execute_pipeline()."""

	@pytest.mark.asyncio
	@patch('app.features.img2img.base_img2img.safety_checker_service')
	@patch('app.features.img2img.base_img2img.Img2ImgPhaseTracker')
	@patch('app.features.img2img.base_img2img.torch.Generator')
	@patch('app.features.img2img.base_img2img.seed_manager')
	@patch('app.features.img2img.base_img2img.progress_callback')
	@patch('app.features.img2img.base_img2img.model_manager')
	@patch('app.features.img2img.base_img2img.pipeline_converter')
	async def test_phase_tracker_start_called_at_beginning(
		self,
		mock_pipeline_converter,
		mock_model_manager,
		mock_progress_callback,
		mock_seed_manager,
		mock_torch_generator,
		mock_phase_tracker_class,
		mock_safety_checker_service,
		sample_config,
		mock_executor,
		sample_init_image,
	):
		"""Test that phase tracker start() is called at beginning of pipeline."""
		from app.features.img2img.base_img2img import BaseImg2Img

		mock_pipe = Mock()
		mock_pipe.device = 'cuda'
		mock_img2img_pipe = Mock()
		mock_img2img_pipe.device = 'cuda'
		mock_model_manager.pipe = mock_pipe
		mock_pipeline_converter.convert_to_img2img.return_value = mock_img2img_pipe
		mock_seed_manager.get_seed.return_value = 12345
		mock_torch_generator.return_value.manual_seed.return_value = Mock()

		mock_output = Mock()
		mock_output.images = [Image.new('RGB', (512, 512))]
		mock_img2img_pipe.return_value = mock_output
		mock_safety_checker_service.check_images.return_value = ([Mock()], [False])

		mock_tracker = Mock()
		mock_phase_tracker_class.return_value = mock_tracker

		generator = BaseImg2Img(mock_executor)

		with patch('asyncio.get_event_loop') as mock_loop:
			mock_loop.return_value.run_in_executor = create_mock_run_in_executor(mock_output)
			await generator.execute_pipeline(sample_config, 'positive', 'negative', sample_init_image)

		mock_phase_tracker_class.assert_called_once_with(has_hires_fix=False)
		mock_tracker.start.assert_called_once()

	@pytest.mark.asyncio
	@patch('app.features.img2img.base_img2img.safety_checker_service')
	@patch('app.features.img2img.base_img2img.Img2ImgPhaseTracker')
	@patch('app.features.img2img.base_img2img.torch.Generator')
	@patch('app.features.img2img.base_img2img.seed_manager')
	@patch('app.features.img2img.base_img2img.progress_callback')
	@patch('app.features.img2img.base_img2img.model_manager')
	@patch('app.features.img2img.base_img2img.pipeline_converter')
	async def test_phase_tracker_complete_called_at_end(
		self,
		mock_pipeline_converter,
		mock_model_manager,
		mock_progress_callback,
		mock_seed_manager,
		mock_torch_generator,
		mock_phase_tracker_class,
		mock_safety_checker_service,
		sample_config,
		mock_executor,
		sample_init_image,
	):
		"""Test that phase tracker complete() is called at end of pipeline."""
		from app.features.img2img.base_img2img import BaseImg2Img

		mock_pipe = Mock()
		mock_pipe.device = 'cuda'
		mock_img2img_pipe = Mock()
		mock_img2img_pipe.device = 'cuda'
		mock_model_manager.pipe = mock_pipe
		mock_pipeline_converter.convert_to_img2img.return_value = mock_img2img_pipe
		mock_seed_manager.get_seed.return_value = 12345
		mock_torch_generator.return_value.manual_seed.return_value = Mock()

		mock_output = Mock()
		mock_output.images = [Image.new('RGB', (512, 512))]
		mock_img2img_pipe.return_value = mock_output
		mock_safety_checker_service.check_images.return_value = ([Mock()], [False])

		mock_tracker = Mock()
		mock_phase_tracker_class.return_value = mock_tracker

		generator = BaseImg2Img(mock_executor)

		with patch('asyncio.get_event_loop') as mock_loop:
			mock_loop.return_value.run_in_executor = create_mock_run_in_executor(mock_output)
			await generator.execute_pipeline(sample_config, 'positive', 'negative', sample_init_image)

		mock_tracker.complete.assert_called_once()

	@pytest.mark.asyncio
	@patch('app.features.img2img.base_img2img.safety_checker_service')
	@patch('app.features.img2img.base_img2img.Img2ImgPhaseTracker')
	@patch('app.features.img2img.base_img2img.torch.Generator')
	@patch('app.features.img2img.base_img2img.seed_manager')
	@patch('app.features.img2img.base_img2img.progress_callback')
	@patch('app.features.img2img.base_img2img.model_manager')
	@patch('app.features.img2img.base_img2img.pipeline_converter')
	async def test_phase_tracker_methods_called_in_correct_order(
		self,
		mock_pipeline_converter,
		mock_model_manager,
		mock_progress_callback,
		mock_seed_manager,
		mock_torch_generator,
		mock_phase_tracker_class,
		mock_safety_checker_service,
		sample_config,
		mock_executor,
		sample_init_image,
	):
		"""Test that phase tracker methods are called in correct order: start -> complete."""
		from app.features.img2img.base_img2img import BaseImg2Img

		mock_pipe = Mock()
		mock_pipe.device = 'cuda'
		mock_img2img_pipe = Mock()
		mock_img2img_pipe.device = 'cuda'
		mock_model_manager.pipe = mock_pipe
		mock_pipeline_converter.convert_to_img2img.return_value = mock_img2img_pipe
		mock_seed_manager.get_seed.return_value = 12345
		mock_torch_generator.return_value.manual_seed.return_value = Mock()

		mock_output = Mock()
		mock_output.images = [Image.new('RGB', (512, 512))]
		mock_img2img_pipe.return_value = mock_output
		mock_safety_checker_service.check_images.return_value = ([Mock()], [False])

		call_order = []
		mock_tracker = Mock()
		mock_tracker.start.side_effect = lambda: call_order.append('start')
		mock_tracker.complete.side_effect = lambda: call_order.append('complete')
		mock_phase_tracker_class.return_value = mock_tracker

		generator = BaseImg2Img(mock_executor)

		with patch('asyncio.get_event_loop') as mock_loop:
			mock_loop.return_value.run_in_executor = create_mock_run_in_executor(mock_output)
			await generator.execute_pipeline(sample_config, 'positive', 'negative', sample_init_image)

		assert call_order == ['start', 'complete']


class TestHiresFixIntegration:
	"""Test hires fix application in img2img."""

	@pytest.mark.asyncio
	@patch('app.cores.generation.hires_fix_utils.hires_fix_processor')
	@patch('app.features.img2img.base_img2img.safety_checker_service')
	@patch('app.features.img2img.base_img2img.Img2ImgPhaseTracker')
	@patch('app.features.img2img.base_img2img.torch.Generator')
	@patch('app.features.img2img.base_img2img.seed_manager')
	@patch('app.features.img2img.base_img2img.progress_callback')
	@patch('app.features.img2img.base_img2img.model_manager')
	@patch('app.features.img2img.base_img2img.pipeline_converter')
	async def test_applies_hires_fix_and_emits_upscaling_phase(
		self,
		mock_pipeline_converter,
		mock_model_manager,
		mock_progress_callback,
		mock_seed_manager,
		mock_torch_generator,
		mock_phase_tracker_class,
		mock_safety_checker_service,
		mock_hires_fix_processor,
		sample_config,
		mock_executor,
		sample_init_image,
	):
		from app.features.img2img.base_img2img import BaseImg2Img

		config_data = sample_config.model_dump()
		config_data['hires_fix'] = HiresFixConfig(
			upscale_factor=2.0,
			upscaler=UpscalerType.LANCZOS,
			denoising_strength=0.7,
			steps=15,
		)
		config = Img2ImgConfig(**config_data)

		mock_pipe = Mock()
		mock_pipe.device = 'cuda'
		mock_img2img_pipe = Mock()
		mock_img2img_pipe.device = 'cuda'
		mock_model_manager.pipe = mock_pipe
		mock_pipeline_converter.convert_to_img2img.return_value = mock_img2img_pipe
		mock_seed_manager.get_seed.return_value = 12345
		mock_torch_generator.return_value.manual_seed.return_value = Mock()

		mock_output = Mock()
		mock_output.images = [Image.new('RGB', (512, 512))]
		mock_img2img_pipe.return_value = mock_output
		mock_safety_checker_service.check_images.return_value = ([Image.new('RGB', (512, 512))], [False])
		mock_hires_fix_processor.apply.return_value = [Image.new('RGB', (1024, 1024))]

		call_order = []
		mock_tracker = Mock()
		mock_tracker.start.side_effect = lambda: call_order.append('start')
		mock_tracker.upscaling.side_effect = lambda: call_order.append('upscaling')
		mock_tracker.complete.side_effect = lambda: call_order.append('complete')
		mock_phase_tracker_class.return_value = mock_tracker

		generator = BaseImg2Img(mock_executor)

		with patch('asyncio.get_event_loop') as mock_loop:
			mock_loop.return_value.run_in_executor = create_mock_run_in_executor(mock_output)
			await generator.execute_pipeline(config, 'final_positive', 'final_negative', sample_init_image)

		mock_phase_tracker_class.assert_called_once_with(has_hires_fix=True)
		assert call_order == ['start', 'upscaling', 'complete']
		mock_hires_fix_processor.apply.assert_called_once()
		request_arg = mock_hires_fix_processor.apply.call_args[0][0]
		assert request_arg.prompt == 'final_positive'
		assert request_arg.negative_prompt == 'final_negative'
		assert request_arg.base_steps == config.steps
		assert request_arg.hires_fix.upscale_factor == 2.0

	@pytest.mark.asyncio
	@patch('app.cores.generation.hires_fix_utils.hires_fix_processor')
	@patch('app.features.img2img.base_img2img.safety_checker_service')
	@patch('app.features.img2img.base_img2img.Img2ImgPhaseTracker')
	@patch('app.features.img2img.base_img2img.torch.Generator')
	@patch('app.features.img2img.base_img2img.seed_manager')
	@patch('app.features.img2img.base_img2img.progress_callback')
	@patch('app.features.img2img.base_img2img.model_manager')
	@patch('app.features.img2img.base_img2img.pipeline_converter')
	async def test_skips_hires_fix_when_all_images_nsfw(
		self,
		mock_pipeline_converter,
		mock_model_manager,
		mock_progress_callback,
		mock_seed_manager,
		mock_torch_generator,
		mock_phase_tracker_class,
		mock_safety_checker_service,
		mock_hires_fix_processor,
		sample_config,
		mock_executor,
		sample_init_image,
	):
		from app.features.img2img.base_img2img import BaseImg2Img

		config_data = sample_config.model_dump()
		config_data['hires_fix'] = HiresFixConfig(
			upscale_factor=2.0,
			upscaler=UpscalerType.LANCZOS,
			denoising_strength=0.7,
			steps=15,
		)
		config = Img2ImgConfig(**config_data)

		mock_pipe = Mock()
		mock_pipe.device = 'cuda'
		mock_img2img_pipe = Mock()
		mock_img2img_pipe.device = 'cuda'
		mock_model_manager.pipe = mock_pipe
		mock_pipeline_converter.convert_to_img2img.return_value = mock_img2img_pipe
		mock_seed_manager.get_seed.return_value = 12345
		mock_torch_generator.return_value.manual_seed.return_value = Mock()

		mock_output = Mock()
		mock_output.images = [Image.new('RGB', (512, 512))]
		mock_img2img_pipe.return_value = mock_output
		mock_safety_checker_service.check_images.return_value = ([Image.new('RGB', (512, 512))], [True])

		mock_tracker = Mock()
		mock_phase_tracker_class.return_value = mock_tracker

		generator = BaseImg2Img(mock_executor)

		with patch('asyncio.get_event_loop') as mock_loop:
			mock_loop.return_value.run_in_executor = create_mock_run_in_executor(mock_output)
			await generator.execute_pipeline(config, 'final_positive', 'final_negative', sample_init_image)

		mock_tracker.upscaling.assert_called_once()
		mock_hires_fix_processor.apply.assert_not_called()
