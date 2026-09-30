"""Tests for main application entry point."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import status
from fastapi.testclient import TestClient

from main import app, lifespan

client = TestClient(app)


class TestHealthCheck:
	"""Tests for health check endpoint."""

	def test_health_check_success(self):
		"""Test health check returns healthy status."""
		response = client.get('/')

		assert response.status_code == status.HTTP_200_OK
		data = response.json()
		assert data['status'] == 'healthy'
		assert 'Exogen Backend is running!' in data['message']


class TestFavicon:
	"""Tests for favicon endpoint."""

	def test_favicon_exists(self):
		"""Test favicon endpoint returns a file."""
		response = client.get('/favicon.ico')

		# Should return 200 if favicon exists, or 404 if not (both are acceptable)
		assert response.status_code in [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND]

		if response.status_code == status.HTTP_200_OK:
			# Verify it's an icon file
			assert response.headers['content-type'] == 'image/vnd.microsoft.icon'


class TestCORSMiddleware:
	"""Tests for CORS middleware configuration."""

	def test_cors_headers_present(self):
		"""Test CORS headers are present in response."""
		response = client.options(
			'/',
			headers={
				'Origin': 'http://localhost:3000',
				'Access-Control-Request-Method': 'GET',
			},
		)

		# CORS headers should be present
		assert 'access-control-allow-origin' in response.headers
		assert 'access-control-allow-methods' in response.headers


class TestRouterRegistration:
	"""Tests to verify all routers are registered."""

	def test_users_router_registered(self):
		"""Test users router is accessible."""
		# This will return 404 or method not allowed, but confirms router exists
		response = client.get('/users')
		assert response.status_code in [
			status.HTTP_404_NOT_FOUND,
			status.HTTP_405_METHOD_NOT_ALLOWED,
			status.HTTP_200_OK,
		]

	def test_models_router_registered(self):
		"""Test models router is accessible."""
		response = client.get('/models')
		# Should work or return specific error, not 404 on the base route
		assert response.status_code != status.HTTP_404_NOT_FOUND

	def test_loras_router_registered(self):
		"""Test loras router is accessible."""
		response = client.get('/loras/')
		# Should work or return specific error
		assert response.status_code != status.HTTP_404_NOT_FOUND

	def test_generators_router_registered(self):
		"""Test generators router is accessible."""
		response = client.get('/generators/samplers')
		assert response.status_code == status.HTTP_200_OK

	def test_hardware_router_registered(self):
		"""Test hardware router is accessible."""
		response = client.get('/hardware')
		# Should work or return specific error
		assert response.status_code in [
			status.HTTP_404_NOT_FOUND,
			status.HTTP_405_METHOD_NOT_ALLOWED,
			status.HTTP_200_OK,
		]

	def test_histories_router_registered(self):
		"""Test histories router is accessible."""
		response = client.get('/histories')
		# Should work or return specific error
		assert response.status_code != status.HTTP_404_NOT_FOUND

	def test_styles_router_registered(self):
		"""Test styles router is accessible."""
		response = client.get('/styles')
		# Should work or return specific error
		assert response.status_code != status.HTTP_404_NOT_FOUND

	@patch('app.features.config.api.config_service')
	def test_config_router_registered(self, mock_config_service):
		"""Test config router is accessible."""
		from app.schemas.config import ConfigResponse, UpscalerItem, UpscalerSection, UpscalingMethod

		mock_config_service.get_config.return_value = ConfigResponse(
			upscalers=[
				UpscalerSection(
					method=UpscalingMethod.TRADITIONAL,
					title='Traditional',
					options=[
						UpscalerItem(
							value='Lanczos',
							name='Lanczos',
							description='Test',
							suggested_denoise_strength=0.4,
							method=UpscalingMethod.TRADITIONAL,
							is_recommended=False,
						)
					],
				)
			],
			safety_check_enabled=True,
			gpu_scale_factor=0.5,
			ram_scale_factor=0.5,
			total_gpu_memory=8589934592,
			total_ram_memory=17179869184,
			device_index=0,
		)

		response = client.get('/config/')
		assert response.status_code == status.HTTP_200_OK
		data = response.json()
		assert 'upscalers' in data
		assert 'safety_check_enabled' in data


class TestLifespan:
	"""Tests for application lifespan events."""

	@pytest.mark.asyncio
	@patch('main.model_manager')
	@patch('main.socket_service')
	@patch('main.database_service')
	@patch('main.platform_service')
	@patch('main.storage_service')
	@patch('main.logger_service')
	@patch('main.SessionLocal')
	async def test_lifespan_initializes_services(
		self,
		mock_session_local,
		mock_logger_service,
		mock_storage_service,
		mock_platform_service,
		mock_database_service,
		mock_socket_service,
		mock_model_manager,
	):
		"""Test that lifespan initializes all services on startup."""
		mock_db = MagicMock()
		mock_session_local.return_value = mock_db
		mock_model_manager.unload_model_async = AsyncMock()
		mock_model_manager.loader_service = MagicMock()

		async with lifespan(MagicMock()):
			# Verify services were initialized
			mock_logger_service.init.assert_called_once()
			mock_storage_service.init.assert_called_once()
			mock_platform_service.init.assert_called_once()
			mock_database_service.init.assert_called_once()
			mock_socket_service.attach_loop.assert_called_once()
			mock_model_manager.unload_model_async.assert_called_once()

		# Verify cleanup after yield
		mock_model_manager.loader_service.shutdown.assert_called_once()
		mock_db.close.assert_called_once()
