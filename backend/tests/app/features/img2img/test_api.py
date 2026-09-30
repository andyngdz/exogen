"""Tests for img2img API endpoints."""

from unittest.mock import AsyncMock, Mock, patch

import pytest
from fastapi import status
from fastapi.testclient import TestClient

from app.schemas.img2img import ImageGenerationItem, ImageGenerationResponse
from main import app

client = TestClient(app)


@pytest.fixture
def mock_img2img_service():
	"""Mock img2img_service for API tests."""
	with patch('app.features.img2img.api.img2img_service') as mock_service:
		yield mock_service


@pytest.fixture
def mock_database():
	"""Mock database dependencies."""
	with patch('app.features.img2img.api.database_service') as mock_db:
		mock_session = Mock()
		mock_db.get_db.return_value = mock_session
		yield mock_db, mock_session


@pytest.fixture
def mock_add_generated_image():
	"""Mock add_generated_image to prevent database operations."""
	with patch('app.features.img2img.api.add_generated_image') as mock:
		yield mock


@pytest.fixture
def sample_img2img_request():
	"""Create sample img2img request payload."""
	base64_image = (
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ'
		'AAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
	)
	return {
		'history_id': 1,
		'config': {
			'init_image': base64_image,
			'strength': 0.75,
			'resize_mode': 'resize',
			'prompt': 'test prompt',
			'width': 512,
			'height': 512,
			'steps': 20,
			'cfg_scale': 7.5,
			'number_of_images': 1,
			'seed': -1,
			'sampler': 'EULER_A',
			'styles': [],
		},
	}


class TestImg2ImgEndpoint:
	def test_successful_img2img_generation(
		self, mock_img2img_service, mock_database, mock_add_generated_image, sample_img2img_request
	):
		"""Test successful img2img generation."""
		mock_db, mock_session = mock_database

		# Mock service response
		mock_response = ImageGenerationResponse(
			items=[ImageGenerationItem(path='/static/test.png', file_name='test')], nsfw_content_detected=[False]
		)
		mock_img2img_service.generate_image_from_image = AsyncMock(return_value=mock_response)

		# Make request
		response = client.post('/img2img/', json=sample_img2img_request)

		assert response.status_code == status.HTTP_200_OK
		data = response.json()
		assert 'items' in data
		assert len(data['items']) == 1
		assert data['items'][0]['path'] == '/static/test.png'
		assert data['nsfw_content_detected'] == [False]

	def test_img2img_with_no_model_loaded(
		self, mock_img2img_service, mock_database, mock_add_generated_image, sample_img2img_request
	):
		"""Test img2img when no model is loaded."""
		mock_db, mock_session = mock_database
		mock_img2img_service.generate_image_from_image = AsyncMock(side_effect=ValueError('No model is currently loaded'))

		response = client.post('/img2img/', json=sample_img2img_request)

		assert response.status_code == status.HTTP_400_BAD_REQUEST
		assert 'No model is currently loaded' in response.json()['detail']

	def test_img2img_with_invalid_base64(
		self, mock_img2img_service, mock_database, mock_add_generated_image, sample_img2img_request
	):
		"""Test img2img with invalid base64 image."""
		mock_db, mock_session = mock_database
		mock_img2img_service.generate_image_from_image = AsyncMock(side_effect=ValueError('Failed to decode base64 image'))

		response = client.post('/img2img/', json=sample_img2img_request)

		assert response.status_code == status.HTTP_400_BAD_REQUEST
		assert 'Failed to decode base64 image' in response.json()['detail']

	def test_img2img_with_missing_required_fields(self, mock_database):
		"""Test img2img with missing required fields."""
		mock_db, mock_session = mock_database
		invalid_request = {'history_id': 1, 'config': {'prompt': 'test'}}  # Missing init_image

		response = client.post('/img2img/', json=invalid_request)

		assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

	def test_img2img_with_invalid_strength(self, mock_database, sample_img2img_request):
		"""Test img2img with invalid strength value."""
		mock_db, mock_session = mock_database
		sample_img2img_request['config']['strength'] = 1.5  # Invalid: > 1.0

		response = client.post('/img2img/', json=sample_img2img_request)

		assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
