from unittest.mock import MagicMock, Mock, patch

import pytest
from diffusers.pipelines.auto_pipeline import AutoPipelineForImage2Image, AutoPipelineForText2Image

from app.cores.pipeline_converter.pipeline_converter import pipeline_converter


class TestPipelineConverter:
	"""Tests for PipelineConverter class."""

	def test_convert_to_img2img_with_none_pipe(self) -> None:
		"""Test that converting None pipe raises ValueError."""
		with pytest.raises(ValueError, match='Pipeline is None'):
			pipeline_converter.convert_to_img2img(None)

	def test_convert_to_img2img_already_img2img(self) -> None:
		"""Test converting pipeline that's already img2img returns same pipe."""
		mock_pipe = Mock(spec=AutoPipelineForImage2Image)

		result = pipeline_converter.convert_to_img2img(mock_pipe)

		assert result is mock_pipe

	@patch.object(AutoPipelineForImage2Image, 'from_pipe')
	def test_convert_to_img2img_from_text2img(self, mock_from_pipe: Mock) -> None:
		"""Test converting text2img pipeline to img2img."""
		mock_text2img_pipe = Mock(spec=AutoPipelineForText2Image)
		mock_img2img_pipe = Mock(spec=AutoPipelineForImage2Image)
		mock_from_pipe.return_value = mock_img2img_pipe

		result = pipeline_converter.convert_to_img2img(mock_text2img_pipe)

		assert result is mock_img2img_pipe
		mock_from_pipe.assert_called_once_with(mock_text2img_pipe)

	@patch.object(AutoPipelineForImage2Image, 'from_pipe')
	def test_convert_to_img2img_raises_on_error(self, mock_from_pipe: Mock) -> None:
		"""Test that conversion errors are propagated."""
		mock_text2img_pipe = Mock(spec=AutoPipelineForText2Image)
		mock_from_pipe.side_effect = RuntimeError('Conversion failed')

		with pytest.raises(RuntimeError, match='Conversion failed'):
			pipeline_converter.convert_to_img2img(mock_text2img_pipe)

	def test_convert_to_text2img_with_none_pipe(self) -> None:
		"""Test that converting None pipe raises ValueError."""
		with pytest.raises(ValueError, match='Pipeline is None'):
			pipeline_converter.convert_to_text2img(None)

	def test_convert_to_text2img_already_text2img(self) -> None:
		"""Test converting pipeline that's already text2img returns same pipe."""
		mock_pipe = Mock(spec=AutoPipelineForText2Image)

		result = pipeline_converter.convert_to_text2img(mock_pipe)

		assert result is mock_pipe

	@patch.object(AutoPipelineForText2Image, 'from_pipe')
	def test_convert_to_text2img_from_img2img(self, mock_from_pipe: Mock) -> None:
		"""Test converting img2img pipeline to text2img."""
		mock_img2img_pipe = Mock(spec=AutoPipelineForImage2Image)
		mock_text2img_pipe = Mock(spec=AutoPipelineForText2Image)
		mock_from_pipe.return_value = mock_text2img_pipe

		result = pipeline_converter.convert_to_text2img(mock_img2img_pipe)

		assert result is mock_text2img_pipe
		mock_from_pipe.assert_called_once_with(mock_img2img_pipe)

	@patch.object(AutoPipelineForText2Image, 'from_pipe')
	def test_convert_to_text2img_raises_on_error(self, mock_from_pipe: Mock) -> None:
		"""Test that conversion errors are propagated."""
		mock_img2img_pipe = Mock(spec=AutoPipelineForImage2Image)
		mock_from_pipe.side_effect = RuntimeError('Conversion failed')

		with pytest.raises(RuntimeError, match='Conversion failed'):
			pipeline_converter.convert_to_text2img(mock_img2img_pipe)

	def test_get_pipeline_type_with_none(self) -> None:
		"""Test pipeline type detection with None."""
		result = pipeline_converter.get_pipeline_type(None)
		assert result == 'unknown'

	def test_get_pipeline_type_text2img(self) -> None:
		"""Test pipeline type detection for text2img."""
		mock_pipe = MagicMock()
		# Remove image attribute to simulate text2img
		del mock_pipe.image

		result = pipeline_converter.get_pipeline_type(mock_pipe)
		assert result == 'text2img'

	def test_get_pipeline_type_img2img(self) -> None:
		"""Test pipeline type detection for img2img."""
		mock_pipe = MagicMock()
		# Has image attribute but not mask_image
		mock_pipe.image = MagicMock()
		del mock_pipe.mask_image

		result = pipeline_converter.get_pipeline_type(mock_pipe)
		assert result == 'img2img'

	def test_get_pipeline_type_inpainting(self) -> None:
		"""Test pipeline type detection for inpainting."""
		mock_pipe = MagicMock()
		# Has both image and mask_image attributes
		mock_pipe.image = MagicMock()
		mock_pipe.mask_image = MagicMock()

		result = pipeline_converter.get_pipeline_type(mock_pipe)
		assert result == 'inpainting'
