"""Tests for LoRA API endpoints."""

from datetime import datetime
from unittest.mock import patch

from fastapi import status
from fastapi.testclient import TestClient

from app.database.models import LoRA
from main import app

client = TestClient(app)


class TestUploadLoRAEndpoint:
	"""Tests for POST /loras/upload endpoint."""

	def test_upload_lora_success(self):
		"""Test successful LoRA upload via API."""
		from unittest.mock import MagicMock

		mock_lora = LoRA(
			id=1,
			name='test.safetensors',
			created_at=datetime.now(),
			updated_at=datetime.now(),
			file_path='/cache/loras/test.safetensors',
			file_size=102400,
		)

		with patch('app.features.loras.api.lora_service.upload_lora', new=MagicMock(return_value=mock_lora)):
			response = client.post('/loras/upload', json={'file_path': '/source/test.safetensors'})

			assert response.status_code == status.HTTP_201_CREATED
			data = response.json()
			assert data['id'] == 1
			assert data['name'] == 'test.safetensors'
			assert data['file_path'] == '/cache/loras/test.safetensors'
			assert data['file_size'] == 102400

	def test_upload_lora_validation_error(self):
		"""Test upload returns 400 when validation fails."""
		from unittest.mock import MagicMock

		with patch(
			'app.features.loras.api.lora_service.upload_lora', new=MagicMock(side_effect=ValueError('File is too large'))
		):
			response = client.post('/loras/upload', json={'file_path': '/source/huge.safetensors'})

			assert response.status_code == status.HTTP_400_BAD_REQUEST
			data = response.json()
			assert 'File is too large' in data['detail']

	def test_upload_lora_missing_file_path(self):
		"""Test upload returns 422 when file_path is missing."""
		response = client.post('/loras/upload', json={})

		assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestListLoRAsEndpoint:
	"""Tests for GET /loras/ endpoint."""

	def test_list_loras_returns_all(self):
		"""Test list endpoint returns all LoRAs."""
		mock_loras = [
			LoRA(
				id=1,
				name='lora1',
				created_at=datetime.now(),
				updated_at=datetime.now(),
				file_path='/cache/loras/lora1.safetensors',
				file_size=100000,
			),
			LoRA(
				id=2,
				name='lora2',
				created_at=datetime.now(),
				updated_at=datetime.now(),
				file_path='/cache/loras/lora2.safetensors',
				file_size=200000,
			),
		]

		with patch('app.features.loras.api.lora_service.get_all_loras', return_value=mock_loras):
			response = client.get('/loras/')

			assert response.status_code == status.HTTP_200_OK
			data = response.json()
			assert len(data['loras']) == 2
			assert data['loras'][0]['id'] == 1
			assert data['loras'][1]['id'] == 2

	def test_list_loras_returns_empty_list(self):
		"""Test list endpoint returns empty list when no LoRAs exist."""
		with patch('app.features.loras.api.lora_service.get_all_loras', return_value=[]):
			response = client.get('/loras/')

			assert response.status_code == status.HTTP_200_OK
			data = response.json()
			assert data['loras'] == []


class TestGetLoRAByIdEndpoint:
	"""Tests for GET /loras/{lora_id} endpoint."""

	def test_get_lora_by_id_success(self):
		"""Test get by ID returns LoRA when found."""
		mock_lora = LoRA(
			id=5,
			name='specific',
			created_at=datetime.now(),
			updated_at=datetime.now(),
			file_path='/cache/loras/specific.safetensors',
			file_size=150000,
		)

		with patch('app.features.loras.api.lora_service.get_lora_by_id', return_value=mock_lora):
			response = client.get('/loras/5')

			assert response.status_code == status.HTTP_200_OK
			data = response.json()
			assert data['id'] == 5
			assert data['name'] == 'specific'

	def test_get_lora_by_id_not_found(self):
		"""Test get by ID returns 404 when LoRA doesn't exist."""
		with patch(
			'app.features.loras.api.lora_service.get_lora_by_id', side_effect=ValueError('LoRA with id 999 not found')
		):
			response = client.get('/loras/999')

			assert response.status_code == status.HTTP_404_NOT_FOUND
			data = response.json()
			assert 'not found' in data['detail']


class TestDeleteLoRAEndpoint:
	"""Tests for DELETE /loras/{lora_id} endpoint."""

	def test_delete_lora_success(self):
		"""Test successful LoRA deletion via API."""
		with patch('app.features.loras.api.lora_service.delete_lora', return_value=10):
			response = client.delete('/loras/10')

			assert response.status_code == status.HTTP_200_OK
			data = response.json()
			assert data['id'] == 10
			assert 'deleted successfully' in data['message']

	def test_delete_lora_not_found(self):
		"""Test delete returns 404 when LoRA doesn't exist."""
		with patch(
			'app.features.loras.api.lora_service.delete_lora',
			side_effect=ValueError('LoRA with id 999 does not exist'),
		):
			response = client.delete('/loras/999')

			assert response.status_code == status.HTTP_404_NOT_FOUND
			data = response.json()
			assert 'LoRA with id 999 does not exist' in data['detail']


class TestLoRAAPIEdgeCases:
	"""Test edge cases and error handling in API."""

	def test_upload_lora_with_special_characters(self):
		"""Test upload handles file paths with special characters."""
		from unittest.mock import MagicMock

		mock_lora = LoRA(
			id=1,
			name='special-chars (1).safetensors',
			created_at=datetime.now(),
			updated_at=datetime.now(),
			file_path='/cache/loras/special-chars (1).safetensors',
			file_size=50000,
		)

		with patch('app.features.loras.api.lora_service.upload_lora', new=MagicMock(return_value=mock_lora)):
			response = client.post('/loras/upload', json={'file_path': '/source/special-chars (1).safetensors'})

			assert response.status_code == status.HTTP_201_CREATED
			data = response.json()
			assert 'special-chars (1).safetensors' in data['name']

	def test_list_loras_handles_large_response(self):
		"""Test list endpoint handles many LoRAs."""
		# Create 100 mock LoRAs
		mock_loras = [
			LoRA(
				id=i,
				name=f'lora{i}',
				created_at=datetime.now(),
				updated_at=datetime.now(),
				file_path=f'/cache/loras/lora{i}.safetensors',
				file_size=100000,
			)
			for i in range(100)
		]

		with patch('app.features.loras.api.lora_service.get_all_loras', return_value=mock_loras):
			response = client.get('/loras/')

			assert response.status_code == status.HTTP_200_OK
			data = response.json()
			assert len(data['loras']) == 100

	def test_get_lora_by_id_with_invalid_id(self):
		"""Test get by ID handles invalid ID formats."""
		response = client.get('/loras/invalid_id')

		# FastAPI validation should catch this
		assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

	def test_upload_lora_generic_exception(self):
		"""Test upload handles unexpected exceptions."""
		with patch('app.features.loras.api.lora_service.upload_lora', side_effect=RuntimeError('Unexpected error')):
			response = client.post('/loras/upload', json={'file_path': '/source/test.safetensors'})

			assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
			assert response.json()['detail'] == 'Internal server error'

	def test_list_loras_generic_exception(self):
		"""Test list handles unexpected exceptions."""
		with patch('app.features.loras.api.lora_service.get_all_loras', side_effect=RuntimeError('DB connection lost')):
			response = client.get('/loras/')

			assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
			assert response.json()['detail'] == 'Internal server error'

	def test_get_lora_generic_exception(self):
		"""Test get by ID handles unexpected exceptions."""
		with patch('app.features.loras.api.lora_service.get_lora_by_id', side_effect=RuntimeError('DB error')):
			response = client.get('/loras/1')

			assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
			assert response.json()['detail'] == 'Internal server error'

	def test_delete_lora_generic_exception(self):
		"""Test delete handles unexpected exceptions."""
		with patch('app.features.loras.api.lora_service.delete_lora', side_effect=RuntimeError('DB error')):
			response = client.delete('/loras/1')

			assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
			assert response.json()['detail'] == 'Internal server error'
