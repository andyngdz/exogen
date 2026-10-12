"""Tests for generators API endpoints."""

from unittest.mock import AsyncMock, patch

from fastapi import status
from fastapi.testclient import TestClient

from app.schemas.generators import ImageGenerationItem, ImageGenerationResponse
from main import app

client = TestClient(app)


class TestGenerationImageEndpoint:
	"""Tests for POST /generators/ endpoint."""

	def test_generate_image_success(self):
		"""Test successful image generation."""
		mock_response = ImageGenerationResponse(
			items=[
				ImageGenerationItem(path='/outputs/image1.png', file_name='image1.png'),
			],
			nsfw_content_detected=[False],
		)

		with (
			patch('app.features.generators.api.generator_service.generate_image', new=AsyncMock(return_value=mock_response)),
			patch('app.features.generators.api.add_generated_image') as mock_add_image,
		):
			request_data = {
				'config': {
					'prompt': 'A beautiful sunset',
					'negative_prompt': 'ugly, blurry',
					'steps': 20,
					'cfg_scale': 7.5,
					'width': 512,
					'height': 512,
					'seed': -1,
					'sampler': 'EULER_A',  # Must match SamplerType enum
					'number_of_images': 1,
					'hires_fix': None,
					'styles': [],
					'loras': [],
				},
				'history_id': 1,
			}

			response = client.post('/generators/', json=request_data)

			assert response.status_code == status.HTTP_200_OK
			data = response.json()
			assert len(data['items']) == 1
			assert data['items'][0]['file_name'] == 'image1.png'
			assert data['nsfw_content_detected'] == [False]

			# Verify history was saved
			mock_add_image.assert_called_once()

	def test_generate_image_with_loras(self):
		"""Test image generation with LoRAs."""
		mock_response = ImageGenerationResponse(
			items=[
				ImageGenerationItem(path='/outputs/image1.png', file_name='image1.png'),
			],
			nsfw_content_detected=[False],
		)

		with (
			patch('app.features.generators.api.generator_service.generate_image', new=AsyncMock(return_value=mock_response)),
			patch('app.features.generators.api.add_generated_image'),
		):
			request_data = {
				'config': {
					'prompt': 'A character portrait',
					'negative_prompt': 'ugly',
					'steps': 20,
					'cfg_scale': 7.5,
					'width': 512,
					'height': 512,
					'seed': -1,
					'sampler': 'EULER_A',
					'number_of_images': 1,
					'hires_fix': None,
					'styles': [],
					'loras': [{'lora_id': 1, 'weight': 0.8}],
				},
				'history_id': 1,
			}

			response = client.post('/generators/', json=request_data)

			assert response.status_code == status.HTTP_200_OK

	def test_generate_image_no_model_loaded(self):
		"""Test generation fails when no model is loaded."""
		with patch(
			'app.features.generators.api.generator_service.generate_image',
			new=AsyncMock(side_effect=ValueError('No model is currently loaded')),
		):
			request_data = {
				'config': {
					'prompt': 'test',
					'negative_prompt': '',
					'steps': 20,
					'cfg_scale': 7.5,
					'width': 512,
					'height': 512,
					'seed': -1,
					'sampler': 'EULER_A',
					'number_of_images': 1,
					'hires_fix': None,
					'styles': [],
					'loras': [],
				},
				'history_id': 1,
			}

			response = client.post('/generators/', json=request_data)

			assert response.status_code == status.HTTP_400_BAD_REQUEST
			assert 'No model is currently loaded' in response.json()['detail']

	def test_generate_image_invalid_lora(self):
		"""Test generation fails with invalid LoRA ID."""
		with patch(
			'app.features.generators.api.generator_service.generate_image',
			new=AsyncMock(side_effect=ValueError('LoRA with id 999 not found')),
		):
			request_data = {
				'config': {
					'prompt': 'test',
					'negative_prompt': '',
					'steps': 20,
					'cfg_scale': 7.5,
					'width': 512,
					'height': 512,
					'seed': -1,
					'sampler': 'EULER_A',
					'number_of_images': 1,
					'hires_fix': None,
					'styles': [],
					'loras': [{'lora_id': 999, 'weight': 1.0}],
				},
				'history_id': 1,
			}

			response = client.post('/generators/', json=request_data)

			assert response.status_code == status.HTTP_400_BAD_REQUEST
			assert 'LoRA with id 999 not found' in response.json()['detail']

	def test_generate_image_multiple_images(self):
		"""Test generating multiple images in one batch."""
		mock_response = ImageGenerationResponse(
			items=[
				ImageGenerationItem(path='/outputs/image1.png', file_name='image1.png'),
				ImageGenerationItem(path='/outputs/image2.png', file_name='image2.png'),
			],
			nsfw_content_detected=[False, False],
		)

		with (
			patch('app.features.generators.api.generator_service.generate_image', new=AsyncMock(return_value=mock_response)),
			patch('app.features.generators.api.add_generated_image'),
		):
			request_data = {
				'config': {
					'prompt': 'test',
					'negative_prompt': '',
					'steps': 20,
					'cfg_scale': 7.5,
					'width': 512,
					'height': 512,
					'seed': -1,
					'sampler': 'EULER_A',
					'number_of_images': 2,
					'hires_fix': None,
					'styles': [],
					'loras': [],
				},
				'history_id': 1,
			}

			response = client.post('/generators/', json=request_data)

			assert response.status_code == status.HTTP_200_OK
			data = response.json()
			assert len(data['items']) == 2


class TestGetSamplersEndpoint:
	"""Tests for GET /generators/samplers endpoint."""

	def test_get_samplers_success(self):
		"""Test retrieving all available samplers."""
		response = client.get('/generators/samplers')

		assert response.status_code == status.HTTP_200_OK
		data = response.json()

		# Check that we get a list of samplers
		assert isinstance(data, list)
		assert len(data) > 0

		# Check sampler structure
		for sampler in data:
			assert 'name' in sampler
			assert 'value' in sampler


class TestGeneratorAPIEdgeCases:
	"""Test edge cases and error handling in generator API."""

	def test_generate_with_empty_prompt(self):
		"""Test generation with empty prompt (should still work)."""
		mock_response = ImageGenerationResponse(
			items=[
				ImageGenerationItem(path='/outputs/image1.png', file_name='image1.png'),
			],
			nsfw_content_detected=[False],
		)

		with (
			patch('app.features.generators.api.generator_service.generate_image', new=AsyncMock(return_value=mock_response)),
			patch('app.features.generators.api.add_generated_image'),
		):
			request_data = {
				'config': {
					'prompt': '',  # Empty prompt
					'negative_prompt': '',
					'steps': 20,
					'cfg_scale': 7.5,
					'width': 512,
					'height': 512,
					'seed': -1,
					'sampler': 'EULER_A',
					'number_of_images': 1,
					'hires_fix': None,
					'styles': [],
					'loras': [],
				},
				'history_id': 1,
			}

			response = client.post('/generators/', json=request_data)

			assert response.status_code == status.HTTP_200_OK

	def test_generate_with_styles(self):
		"""Test generation with style presets."""
		mock_response = ImageGenerationResponse(
			items=[
				ImageGenerationItem(path='/outputs/image1.png', file_name='image1.png'),
			],
			nsfw_content_detected=[False],
		)

		with (
			patch('app.features.generators.api.generator_service.generate_image', new=AsyncMock(return_value=mock_response)),
			patch('app.features.generators.api.add_generated_image'),
		):
			request_data = {
				'config': {
					'prompt': 'A portrait',
					'negative_prompt': '',
					'steps': 20,
					'cfg_scale': 7.5,
					'width': 512,
					'height': 512,
					'seed': -1,
					'sampler': 'EULER_A',
					'number_of_images': 1,
					'hires_fix': None,
					'styles': ['sai-anime', 'sai-photographic'],
					'loras': [],
				},
				'history_id': 1,
			}

			response = client.post('/generators/', json=request_data)

			assert response.status_code == status.HTTP_200_OK

	def test_generate_with_high_resolution(self):
		"""Test generation with high resolution settings."""
		mock_response = ImageGenerationResponse(
			items=[
				ImageGenerationItem(path='/outputs/image1.png', file_name='image1.png'),
			],
			nsfw_content_detected=[False],
		)

		with (
			patch('app.features.generators.api.generator_service.generate_image', new=AsyncMock(return_value=mock_response)),
			patch('app.features.generators.api.add_generated_image'),
		):
			request_data = {
				'config': {
					'prompt': 'test',
					'negative_prompt': '',
					'steps': 20,
					'cfg_scale': 7.5,
					'width': 1024,
					'height': 1024,
					'seed': -1,
					'sampler': 'EULER_A',
					'number_of_images': 1,
					'hires_fix': {
						'upscale_factor': 2.0,
						'upscaler': 'Lanczos',
						'denoising_strength': 0.7,
						'steps': 0,
					},
					'styles': [],
					'loras': [],
				},
				'history_id': 1,
			}

			response = client.post('/generators/', json=request_data)

			assert response.status_code == status.HTTP_200_OK
