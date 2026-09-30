"""Tests for Img2ImgService after modular refactoring."""

from collections.abc import Generator
from typing import TypeAlias
from unittest.mock import AsyncMock, Mock, patch

import pytest
import torch
from PIL import Image

from app.cores.samplers import SamplerType
from app.features.img2img.service import Img2ImgService
from app.schemas.img2img import ImageGenerationItem, ImageGenerationResponse, Img2ImgConfig

MockServiceFixture: TypeAlias = tuple[Img2ImgService, Mock, Mock, Mock, Mock, Mock, Mock, Mock]


@pytest.fixture
def mock_service() -> Generator[MockServiceFixture, None, None]:
	"""Create Img2ImgService with mocked module dependencies."""
	with (
		patch('app.features.img2img.service.model_manager') as mock_model_manager,
		patch('app.features.img2img.service.config_validator') as mock_config_validator,
		patch('app.features.img2img.service.resource_manager') as mock_resource_manager,
		patch('app.features.img2img.service.lora_loader') as mock_lora_loader,
		patch('app.features.img2img.service.prompt_processor') as mock_prompt_processor,
		patch('app.features.img2img.service.response_builder') as mock_response_builder,
		patch('app.features.img2img.service.image_service') as mock_image_service,
	):
		# Configure mocks
		mock_model_manager.has_model = True
		mock_config_validator.validate_config = Mock()
		mock_resource_manager.prepare_for_generation = Mock()
		mock_resource_manager.cleanup_after_generation = Mock()
		mock_resource_manager.handle_oom_error = Mock()
		mock_lora_loader.load_loras_for_generation = Mock(return_value=False)
		mock_lora_loader.unload_loras = Mock()
		mock_prompt_processor.prepare_prompts = Mock(return_value=('positive', 'negative'))
		mock_response_builder.build_response = Mock(
			return_value=ImageGenerationResponse(
				items=[ImageGenerationItem(path='/static/test.png', file_name='test')],
				nsfw_content_detected=[False],
			)
		)

		# Configure image service
		test_image = Image.new('RGB', (512, 512), color='blue')
		mock_image_service.from_base64.return_value = test_image
		mock_image_service.resize_image.return_value = test_image

		service = Img2ImgService()

		yield (
			service,
			mock_model_manager,
			mock_config_validator,
			mock_resource_manager,
			mock_lora_loader,
			mock_prompt_processor,
			mock_response_builder,
			mock_image_service,
		)


@pytest.fixture
def sample_config() -> Img2ImgConfig:
	"""Create sample Img2ImgConfig for testing."""
	return Img2ImgConfig(
		init_image='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
		strength=0.75,
		resize_mode='resize',
		prompt='test prompt',
		width=512,
		height=512,
		steps=20,
		cfg_scale=7.5,
		number_of_images=1,
		seed=-1,
		sampler=SamplerType.EULER_A,
		styles=[],
	)


@pytest.fixture
def mock_db() -> Mock:
	"""Create mock database session."""
	return Mock()


class TestImg2ImgServiceInit:
	"""Tests for Img2ImgService initialization."""

	def test_creates_executor(self, mock_service: MockServiceFixture) -> None:
		"""Test that service creates ThreadPoolExecutor."""
		service, *_ = mock_service
		assert service.executor is not None
		assert hasattr(service.executor, 'submit')

	def test_creates_base_generator(self, mock_service: MockServiceFixture) -> None:
		"""Test that service creates BaseImg2Img instance."""
		service, *_ = mock_service
		assert service.generator is not None
		assert hasattr(service.generator, 'execute_pipeline')


class TestGenerateImageFromImageOrchestration:
	"""Tests for generate_image_from_image orchestration flow."""

	@pytest.mark.asyncio
	async def test_validates_config_before_generation(
		self, mock_service: MockServiceFixture, sample_config: Img2ImgConfig, mock_db: Mock
	) -> None:
		"""Test that config validation is called first."""
		service, _, mock_config_validator, *_ = mock_service

		mock_execute = AsyncMock(return_value=Mock(images=[Image.new('RGB', (64, 64))], nsfw_content_detected=[False]))
		with patch.object(service.generator, 'execute_pipeline', mock_execute):
			await service.generate_image_from_image(sample_config, mock_db)

		mock_config_validator.validate_config.assert_called_once_with(sample_config)

	@pytest.mark.asyncio
	async def test_prepares_resources_before_generation(
		self, mock_service: MockServiceFixture, sample_config: Img2ImgConfig, mock_db: Mock
	) -> None:
		"""Test that resource preparation is called."""
		service, _, _, mock_resource_manager, *_ = mock_service

		mock_execute = AsyncMock(return_value=Mock(images=[Image.new('RGB', (64, 64))], nsfw_content_detected=[False]))
		with patch.object(service.generator, 'execute_pipeline', mock_execute):
			await service.generate_image_from_image(sample_config, mock_db)

		mock_resource_manager.prepare_for_generation.assert_called_once()

	@pytest.mark.asyncio
	async def test_loads_loras_when_specified(
		self, mock_service: MockServiceFixture, sample_config: Img2ImgConfig, mock_db: Mock
	) -> None:
		"""Test that LoRAs are loaded when configured."""
		service, _, _, _, mock_lora_loader, *_ = mock_service
		mock_lora_loader.load_loras_for_generation.return_value = True

		mock_execute = AsyncMock(return_value=Mock(images=[Image.new('RGB', (64, 64))], nsfw_content_detected=[False]))
		with patch.object(service.generator, 'execute_pipeline', mock_execute):
			await service.generate_image_from_image(sample_config, mock_db)

		mock_lora_loader.load_loras_for_generation.assert_called_once_with(sample_config, mock_db)

	@pytest.mark.asyncio
	async def test_processes_prompts_with_styles(
		self, mock_service: MockServiceFixture, sample_config: Img2ImgConfig, mock_db: Mock
	) -> None:
		"""Test that prompts are processed through prompt_processor."""
		service, _, _, _, _, mock_prompt_processor, _, _ = mock_service

		mock_execute = AsyncMock(return_value=Mock(images=[Image.new('RGB', (64, 64))], nsfw_content_detected=[False]))
		with patch.object(service.generator, 'execute_pipeline', mock_execute):
			await service.generate_image_from_image(sample_config, mock_db)

		mock_prompt_processor.prepare_prompts.assert_called_once_with(sample_config)

	@pytest.mark.asyncio
	async def test_decodes_and_resizes_image(
		self, mock_service: MockServiceFixture, sample_config: Img2ImgConfig, mock_db: Mock
	) -> None:
		"""Test that source image is decoded and resized."""
		service, _, _, _, _, _, _, mock_image_service = mock_service

		mock_execute = AsyncMock(return_value=Mock(images=[Image.new('RGB', (64, 64))], nsfw_content_detected=[False]))
		with patch.object(service.generator, 'execute_pipeline', mock_execute):
			await service.generate_image_from_image(sample_config, mock_db)

		mock_image_service.from_base64.assert_called_once_with(sample_config.init_image)
		mock_image_service.resize_image.assert_called_once()

	@pytest.mark.asyncio
	async def test_executes_pipeline_with_processed_prompts(
		self, mock_service: MockServiceFixture, sample_config: Img2ImgConfig, mock_db: Mock
	) -> None:
		"""Test that pipeline execution receives processed prompts and image."""
		service, _, _, _, _, mock_prompt_processor, _, mock_image_service = mock_service
		mock_prompt_processor.prepare_prompts.return_value = ('positive_test', 'negative_test')
		test_image = Image.new('RGB', (512, 512))
		mock_image_service.resize_image.return_value = test_image

		mock_execute = AsyncMock(return_value=Mock(images=[Image.new('RGB', (64, 64))], nsfw_content_detected=[False]))
		with patch.object(service.generator, 'execute_pipeline', mock_execute):
			await service.generate_image_from_image(sample_config, mock_db)

			mock_execute.assert_called_once_with(sample_config, 'positive_test', 'negative_test', test_image)

	@pytest.mark.asyncio
	async def test_builds_response_from_output(
		self, mock_service: MockServiceFixture, sample_config: Img2ImgConfig, mock_db: Mock
	) -> None:
		"""Test that response is built from pipeline output."""
		service, _, _, _, _, _, mock_response_builder, _ = mock_service

		mock_output = Mock(images=[Image.new('RGB', (64, 64))], nsfw_content_detected=[False])
		mock_execute = AsyncMock(return_value=mock_output)
		with patch.object(service.generator, 'execute_pipeline', mock_execute):
			await service.generate_image_from_image(sample_config, mock_db)

		mock_response_builder.build_response.assert_called_once()

	@pytest.mark.asyncio
	async def test_returns_image_generation_response(
		self, mock_service: MockServiceFixture, sample_config: Img2ImgConfig, mock_db: Mock
	) -> None:
		"""Test that method returns ImageGenerationResponse."""
		service, *_ = mock_service

		mock_execute = AsyncMock(return_value=Mock(images=[Image.new('RGB', (64, 64))], nsfw_content_detected=[False]))
		with patch.object(service.generator, 'execute_pipeline', mock_execute):
			result = await service.generate_image_from_image(sample_config, mock_db)

		assert isinstance(result, ImageGenerationResponse)
		assert len(result.items) == 1
		assert result.items[0].path == '/static/test.png'


class TestGenerateImageFromImageErrorHandling:
	"""Tests for error handling in generate_image_from_image."""

	@pytest.mark.asyncio
	async def test_raises_error_when_no_model_loaded(
		self, mock_service: MockServiceFixture, sample_config: Img2ImgConfig, mock_db: Mock
	) -> None:
		"""Test that error is raised when no model is loaded."""
		service, mock_model_manager, *_ = mock_service
		mock_model_manager.has_model = False

		with pytest.raises(ValueError, match='No model is currently loaded'):
			await service.generate_image_from_image(sample_config, mock_db)

	@pytest.mark.asyncio
	async def test_raises_error_when_validation_fails(
		self, mock_service: MockServiceFixture, sample_config: Img2ImgConfig, mock_db: Mock
	) -> None:
		"""Test that validation errors are propagated."""
		service, _, mock_config_validator, *_ = mock_service
		mock_config_validator.validate_config.side_effect = ValueError('Invalid config')

		with pytest.raises(ValueError, match='Invalid config'):
			await service.generate_image_from_image(sample_config, mock_db)

	@pytest.mark.asyncio
	async def test_handles_file_not_found_error(
		self, mock_service: MockServiceFixture, sample_config: Img2ImgConfig, mock_db: Mock
	) -> None:
		"""Test FileNotFoundError handling."""
		service, *_ = mock_service
		mock_execute = AsyncMock(side_effect=FileNotFoundError('Model files missing'))
		with patch.object(service.generator, 'execute_pipeline', mock_execute):
			with pytest.raises(ValueError, match='Required files not found'):
				await service.generate_image_from_image(sample_config, mock_db)

	@pytest.mark.asyncio
	async def test_handles_oom_error_and_calls_cleanup(
		self, mock_service: MockServiceFixture, sample_config: Img2ImgConfig, mock_db: Mock
	) -> None:
		"""Test OOM error handling."""
		service, _, _, mock_resource_manager, *_ = mock_service
		mock_execute = AsyncMock(side_effect=torch.cuda.OutOfMemoryError('CUDA OOM'))
		with patch.object(service.generator, 'execute_pipeline', mock_execute):
			with pytest.raises(ValueError, match='Out of memory'):
				await service.generate_image_from_image(sample_config, mock_db)

		mock_resource_manager.handle_oom_error.assert_called_once()

	@pytest.mark.asyncio
	async def test_handles_general_exception(
		self, mock_service: MockServiceFixture, sample_config: Img2ImgConfig, mock_db: Mock
	) -> None:
		"""Test general exception handling."""
		service, *_ = mock_service
		mock_execute = AsyncMock(side_effect=RuntimeError('Something went wrong'))
		with patch.object(service.generator, 'execute_pipeline', mock_execute):
			with pytest.raises(ValueError, match='Failed to generate img2img'):
				await service.generate_image_from_image(sample_config, mock_db)


class TestGenerateImageFromImageCleanup:
	"""Tests for resource cleanup in finally block."""

	@pytest.mark.asyncio
	async def test_cleans_up_resources_after_success(
		self, mock_service: MockServiceFixture, sample_config: Img2ImgConfig, mock_db: Mock
	) -> None:
		"""Test that cleanup is called after successful generation."""
		service, _, _, mock_resource_manager, mock_lora_loader, *_ = mock_service

		mock_execute = AsyncMock(return_value=Mock(images=[Image.new('RGB', (64, 64))], nsfw_content_detected=[False]))
		with patch.object(service.generator, 'execute_pipeline', mock_execute):
			await service.generate_image_from_image(sample_config, mock_db)

		mock_lora_loader.unload_loras.assert_called_once()
		mock_resource_manager.cleanup_after_generation.assert_called_once()

	@pytest.mark.asyncio
	async def test_cleans_up_resources_after_error(
		self, mock_service: MockServiceFixture, sample_config: Img2ImgConfig, mock_db: Mock
	) -> None:
		"""Test that cleanup is called even after errors."""
		service, _, _, mock_resource_manager, mock_lora_loader, *_ = mock_service
		mock_execute = AsyncMock(side_effect=RuntimeError('Test error'))
		with patch.object(service.generator, 'execute_pipeline', mock_execute):
			try:
				await service.generate_image_from_image(sample_config, mock_db)
			except ValueError:
				pass

		mock_lora_loader.unload_loras.assert_called_once()
		mock_resource_manager.cleanup_after_generation.assert_called_once()

	@pytest.mark.asyncio
	async def test_unloads_loras_even_when_not_loaded(
		self, mock_service: MockServiceFixture, sample_config: Img2ImgConfig, mock_db: Mock
	) -> None:
		"""Test that unload_loras is always called regardless of LoRA state."""
		service, _, _, mock_resource_manager, mock_lora_loader, *_ = mock_service
		mock_lora_loader.load_loras_for_generation.return_value = False

		mock_execute = AsyncMock(return_value=Mock(images=[Image.new('RGB', (64, 64))], nsfw_content_detected=[False]))
		with patch.object(service.generator, 'execute_pipeline', mock_execute):
			await service.generate_image_from_image(sample_config, mock_db)

		mock_lora_loader.unload_loras.assert_called_once()
		mock_resource_manager.cleanup_after_generation.assert_called_once()
