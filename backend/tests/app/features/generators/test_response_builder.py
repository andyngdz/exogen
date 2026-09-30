"""Tests for response_builder module."""

from unittest.mock import Mock, patch

from app.schemas.generators import ImageGenerationItem, ImageGenerationResponse


class TestBuildResponse:
	"""Test build_response() method."""

	@patch('app.cores.generation.response_builder.process_generated_images')
	def test_calls_process_generated_images(self, mock_process):
		"""Test that process_generated_images is called with output."""
		from app.cores.generation.response_builder import ResponseBuilder

		# Setup
		mock_output = Mock()
		mock_process.return_value = (
			[ImageGenerationItem(path='/path/test.png', file_name='test.png')],
			[False],
		)
		builder = ResponseBuilder()

		# Execute
		result = builder.build_response(mock_output)

		# Verify
		mock_process.assert_called_once_with(mock_output)
		assert isinstance(result, ImageGenerationResponse)

	@patch('app.cores.generation.response_builder.process_generated_images')
	def test_returns_image_generation_response(self, mock_process):
		"""Test that method returns ImageGenerationResponse."""
		from app.cores.generation.response_builder import ResponseBuilder

		# Setup
		mock_output = Mock()
		items = [
			ImageGenerationItem(path='/path/img1.png', file_name='img1.png'),
			ImageGenerationItem(path='/path/img2.png', file_name='img2.png'),
		]
		nsfw = [False, True]
		mock_process.return_value = (items, nsfw)
		builder = ResponseBuilder()

		# Execute
		result = builder.build_response(mock_output)

		# Verify
		assert isinstance(result, ImageGenerationResponse)
		assert result.items == items
		assert result.nsfw_content_detected == nsfw

	@patch('app.cores.generation.response_builder.process_generated_images')
	def test_handles_empty_results(self, mock_process):
		"""Test handling of empty image results."""
		from app.cores.generation.response_builder import ResponseBuilder

		# Setup
		mock_output = Mock()
		mock_process.return_value = ([], [])
		builder = ResponseBuilder()

		# Execute
		result = builder.build_response(mock_output)

		# Verify
		assert isinstance(result, ImageGenerationResponse)
		assert result.items == []
		assert result.nsfw_content_detected == []

	@patch('app.cores.generation.response_builder.process_generated_images')
	def test_handles_single_image(self, mock_process):
		"""Test handling of single image result."""
		from app.cores.generation.response_builder import ResponseBuilder

		# Setup
		mock_output = Mock()
		items = [ImageGenerationItem(path='/path/single.png', file_name='single.png')]
		nsfw = [False]
		mock_process.return_value = (items, nsfw)
		builder = ResponseBuilder()

		# Execute
		result = builder.build_response(mock_output)

		# Verify
		assert len(result.items) == 1
		assert len(result.nsfw_content_detected) == 1
		assert result.items[0].path == '/path/single.png'
		assert result.nsfw_content_detected[0] is False

	@patch('app.cores.generation.response_builder.process_generated_images')
	def test_handles_all_nsfw_content(self, mock_process):
		"""Test handling when all images are NSFW."""
		from app.cores.generation.response_builder import ResponseBuilder

		# Setup
		mock_output = Mock()
		items = [
			ImageGenerationItem(path='/path/img1.png', file_name='img1.png'),
			ImageGenerationItem(path='/path/img2.png', file_name='img2.png'),
		]
		nsfw = [True, True]
		mock_process.return_value = (items, nsfw)
		builder = ResponseBuilder()

		# Execute
		result = builder.build_response(mock_output)

		# Verify
		assert all(result.nsfw_content_detected)


class TestResponseBuilderSingleton:
	"""Test response_builder singleton."""

	def test_singleton_exists(self):
		"""Test that response_builder singleton instance exists."""
		from app.cores.generation.response_builder import response_builder

		assert response_builder is not None

	def test_singleton_has_build_response_method(self):
		"""Test that singleton has build_response method."""
		from app.cores.generation.response_builder import response_builder

		assert hasattr(response_builder, 'build_response')
		assert callable(response_builder.build_response)
