"""Tests for the image resize endpoint."""

from fastapi import status
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


class TestResizedImage:
	"""Test the /resizes/image endpoint."""

	def test_rejects_path_outside_static_folder(self):
		response = client.get('/resizes/image', params={'file_path': '../config.py', 'width': 10, 'height': 10})

		assert response.status_code == status.HTTP_400_BAD_REQUEST
		assert response.json()['detail'] == 'Invalid image path'

	def test_returns_404_for_missing_image_inside_static_folder(self):
		response = client.get('/resizes/image', params={'file_path': 'missing.png', 'width': 10, 'height': 10})

		assert response.status_code == status.HTTP_404_NOT_FOUND
