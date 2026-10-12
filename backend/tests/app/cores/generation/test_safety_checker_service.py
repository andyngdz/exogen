"""Tests for safety_checker_service module."""

from unittest.mock import Mock, patch

import numpy as np
import pytest
import torch
from PIL import Image


@pytest.fixture
def mock_model_manager():
	"""Create a mock model manager with pipe."""
	with patch('app.cores.generation.safety_checker_service.model_manager') as mock:
		mock_pipe = Mock()
		mock_pipe.device = torch.device('cpu')
		mock_pipe.dtype = torch.float32
		mock.pipe = mock_pipe
		yield mock


@pytest.fixture
def mock_config_crud():
	"""Create a mock config_crud."""
	with patch('app.cores.generation.safety_checker_service.config_crud') as mock:
		mock.get_safety_check_enabled.return_value = True
		yield mock


@pytest.fixture
def mock_session():
	"""Create a mock database session."""
	with patch('app.cores.generation.safety_checker_service.SessionLocal') as mock:
		mock_db = Mock()
		mock.return_value = mock_db
		yield mock


@pytest.fixture
def mock_safety_checker_model():
	"""Create a mock StableDiffusionSafetyChecker."""
	with patch('app.cores.generation.safety_checker_service.StableDiffusionSafetyChecker') as mock_class:
		mock_checker = Mock()
		mock_numpy_image = np.zeros((64, 64, 3), dtype=np.uint8)
		mock_checker.return_value = (np.stack([mock_numpy_image]), [False])
		mock_checker.to = Mock(return_value=mock_checker)
		mock_class.from_pretrained.return_value = mock_checker
		yield mock_class, mock_checker


@pytest.fixture
def mock_feature_extractor():
	"""Create a mock CLIPImageProcessor."""
	with patch('app.cores.generation.safety_checker_service.CLIPImageProcessor') as mock_class:
		mock_extractor = Mock()
		mock_features = Mock()
		mock_features.pixel_values = Mock()
		mock_features.pixel_values.to = Mock(return_value=mock_features.pixel_values)
		mock_extractor.return_value = mock_features
		mock_extractor.return_value.to = Mock(return_value=mock_features)
		mock_class.from_pretrained.return_value = mock_extractor
		yield mock_class, mock_extractor


class TestCheckImages:
	"""Test check_images() method."""

	def test_returns_unchanged_when_disabled(self, mock_model_manager, mock_config_crud, mock_session):
		"""Test that images are returned unchanged when safety check is disabled."""
		from app.cores.generation.safety_checker_service import SafetyCheckerService

		mock_config_crud.get_safety_check_enabled.return_value = False

		service = SafetyCheckerService()
		pil_image = Image.new('RGB', (64, 64), color='red')
		images = [pil_image]

		result_images, nsfw_detected = service.check_images(images)

		assert result_images == images
		assert nsfw_detected == [False]

	def test_loads_and_unloads_when_enabled(
		self,
		mock_model_manager,
		mock_config_crud,
		mock_session,
		mock_safety_checker_model,
		mock_feature_extractor,
	):
		"""Test that safety checker is loaded and unloaded when enabled."""
		from app.cores.generation.safety_checker_service import SafetyCheckerService

		mock_config_crud.get_safety_check_enabled.return_value = True
		mock_class, mock_checker = mock_safety_checker_model

		service = SafetyCheckerService()
		pil_image = Image.new('RGB', (64, 64), color='red')
		images = [pil_image]

		service.check_images(images)

		# Verify model was loaded
		mock_class.from_pretrained.assert_called_once()

		# Verify model was unloaded (attributes should be None)
		assert service._safety_checker is None
		assert service._feature_extractor is None

	def test_runs_safety_check_on_images(
		self,
		mock_model_manager,
		mock_config_crud,
		mock_session,
		mock_safety_checker_model,
		mock_feature_extractor,
	):
		"""Test that safety checker runs on provided images."""
		from app.cores.generation.safety_checker_service import SafetyCheckerService

		mock_config_crud.get_safety_check_enabled.return_value = True
		_, mock_checker = mock_safety_checker_model

		service = SafetyCheckerService()
		pil_image = Image.new('RGB', (64, 64), color='red')
		images = [pil_image]

		service.check_images(images)

		# Verify safety checker was called
		mock_checker.assert_called_once()

	def test_returns_nsfw_flags(
		self,
		mock_model_manager,
		mock_config_crud,
		mock_session,
		mock_safety_checker_model,
		mock_feature_extractor,
	):
		"""Test that NSFW flags are returned correctly."""
		from app.cores.generation.safety_checker_service import SafetyCheckerService

		mock_config_crud.get_safety_check_enabled.return_value = True
		_, mock_checker = mock_safety_checker_model

		# Configure to detect NSFW
		mock_numpy_images = np.stack([np.zeros((64, 64, 3), dtype=np.uint8)] * 2)
		mock_checker.return_value = (mock_numpy_images, [True, False])

		service = SafetyCheckerService()
		images = [Image.new('RGB', (64, 64)), Image.new('RGB', (64, 64))]

		_, nsfw_detected = service.check_images(images)

		assert nsfw_detected == [True, False]

	def test_reads_from_database(self, mock_model_manager, mock_config_crud, mock_session):
		"""Test that safety_check_enabled is read from database."""
		from app.cores.generation.safety_checker_service import SafetyCheckerService

		mock_config_crud.get_safety_check_enabled.return_value = False

		service = SafetyCheckerService()
		images = [Image.new('RGB', (64, 64))]

		service.check_images(images)

		# Verify database was queried
		mock_config_crud.get_safety_check_enabled.assert_called_once()

	def test_closes_database_connection(self, mock_model_manager, mock_config_crud, mock_session):
		"""Test that database connection is closed after use."""
		from app.cores.generation.safety_checker_service import SafetyCheckerService

		mock_config_crud.get_safety_check_enabled.return_value = False
		mock_db = mock_session.return_value

		service = SafetyCheckerService()
		images = [Image.new('RGB', (64, 64))]

		service.check_images(images)

		# Verify database connection was closed
		mock_db.close.assert_called_once()


class TestLoad:
	"""Test _load() method."""

	def test_loads_safety_checker_model(self, mock_safety_checker_model, mock_feature_extractor):
		"""Test that safety checker model is loaded from pretrained."""
		from app.cores.generation.safety_checker_service import SafetyCheckerService

		mock_class, _ = mock_safety_checker_model

		service = SafetyCheckerService()
		service._load(torch.device('cpu'), torch.float32)

		mock_class.from_pretrained.assert_called_once()

	def test_loads_feature_extractor(self, mock_safety_checker_model, mock_feature_extractor):
		"""Test that feature extractor is loaded from pretrained."""
		from app.cores.generation.safety_checker_service import SafetyCheckerService

		mock_class, _ = mock_feature_extractor

		service = SafetyCheckerService()
		service._load(torch.device('cpu'), torch.float32)

		mock_class.from_pretrained.assert_called_once()

	def test_moves_to_device(self, mock_safety_checker_model, mock_feature_extractor):
		"""Test that safety checker is moved to specified device."""
		from app.cores.generation.safety_checker_service import SafetyCheckerService

		_, mock_checker = mock_safety_checker_model

		service = SafetyCheckerService()
		device = torch.device('cuda:0') if torch.cuda.is_available() else torch.device('cpu')
		service._load(device, torch.float16)

		mock_checker.to.assert_called_once_with(device=device, dtype=torch.float16)


class TestUnload:
	"""Test _unload() method."""

	def test_clears_references(self, mock_safety_checker_model, mock_feature_extractor):
		"""Test that model references are cleared."""
		from app.cores.generation.safety_checker_service import SafetyCheckerService

		service = SafetyCheckerService()
		service._load(torch.device('cpu'), torch.float32)

		# Verify models are loaded
		assert service._safety_checker is not None
		assert service._feature_extractor is not None

		service._unload()

		# Verify references are cleared
		assert service._safety_checker is None
		assert service._feature_extractor is None

	def test_invokes_shared_cache_helper_on_unload(self, mock_safety_checker_model, mock_feature_extractor):
		"""Test that unload calls shared cache helper."""
		from app.cores.generation.safety_checker_service import SafetyCheckerService

		service = SafetyCheckerService()
		service._load(torch.device('cpu'), torch.float32)

		with patch('app.cores.generation.safety_checker_service.clear_device_cache') as mock_clear_cache:
			service._unload()
			mock_clear_cache.assert_called_once()

	def test_unload_handles_missing_components(self):
		"""_unload should safely handle when models are already cleared."""
		from app.cores.generation.safety_checker_service import SafetyCheckerService

		service = SafetyCheckerService()
		service._safety_checker = None
		service._feature_extractor = None
		service._device = torch.device('cpu')
		service._dtype = torch.float32

		with patch('app.cores.generation.safety_checker_service.clear_device_cache') as mock_clear_cache:
			service._unload()

		assert service._safety_checker is None
		assert service._feature_extractor is None
		assert service._device is None
		assert service._dtype is None
		mock_clear_cache.assert_called_once()


class TestRunCheck:
	"""Test _run_check() method."""

	def test_converts_pil_to_numpy(
		self,
		mock_model_manager,
		mock_safety_checker_model,
		mock_feature_extractor,
	):
		"""Test that PIL images are converted to numpy arrays."""
		from app.cores.generation.safety_checker_service import SafetyCheckerService

		_, mock_checker = mock_safety_checker_model

		service = SafetyCheckerService()
		service._load(torch.device('cpu'), torch.float32)

		pil_image = Image.new('RGB', (64, 64), color='red')
		service._run_check([pil_image])

		# Verify numpy array was passed
		call_kwargs = mock_checker.call_args[1]
		assert isinstance(call_kwargs['images'], np.ndarray)

	def test_converts_numpy_back_to_pil(
		self,
		mock_model_manager,
		mock_safety_checker_model,
		mock_feature_extractor,
	):
		"""Test that numpy results are converted back to PIL."""
		from app.cores.generation.safety_checker_service import SafetyCheckerService

		_, mock_checker = mock_safety_checker_model

		service = SafetyCheckerService()
		service._load(torch.device('cpu'), torch.float32)

		pil_image = Image.new('RGB', (64, 64), color='red')
		result_images, _ = service._run_check([pil_image])

		assert all(isinstance(img, Image.Image) for img in result_images)

	def test_logs_warning_when_nsfw_detected(
		self,
		mock_model_manager,
		mock_safety_checker_model,
		mock_feature_extractor,
		caplog,
	):
		"""Test that warning is logged when NSFW content detected."""
		from app.cores.generation.safety_checker_service import SafetyCheckerService

		_, mock_checker = mock_safety_checker_model
		mock_numpy_images = np.stack([np.zeros((64, 64, 3), dtype=np.uint8)] * 2)
		mock_checker.return_value = (mock_numpy_images, [True, False])

		service = SafetyCheckerService()
		service._load(torch.device('cpu'), torch.float32)

		images = [Image.new('RGB', (64, 64)), Image.new('RGB', (64, 64))]

		with caplog.at_level('WARNING'):
			service._run_check(images)

		assert 'NSFW content detected' in caplog.text

	def test_logs_info_when_no_nsfw(
		self,
		mock_model_manager,
		mock_safety_checker_model,
		mock_feature_extractor,
		caplog,
	):
		"""Test that info is logged when no NSFW content."""
		from app.cores.generation.safety_checker_service import SafetyCheckerService

		service = SafetyCheckerService()
		service._load(torch.device('cpu'), torch.float32)

		pil_image = Image.new('RGB', (64, 64), color='red')

		with caplog.at_level('INFO'):
			service._run_check([pil_image])

		assert 'No NSFW content detected' in caplog.text

	def test_run_check_returns_without_models(self, caplog):
		"""_run_check should early-exit when models aren't loaded."""
		from app.cores.generation.safety_checker_service import SafetyCheckerService

		service = SafetyCheckerService()

		pil_image = Image.new('RGB', (64, 64), color='red')

		with caplog.at_level('ERROR'):
			images, flags = service._run_check([pil_image])

		assert images == [pil_image]
		assert flags == [False]
		assert 'Safety checker not loaded' in caplog.text


class TestSingleton:
	"""Test singleton instance behavior."""

	def test_singleton_is_exported(self):
		"""Verify safety_checker_service singleton is exported."""
		from app.cores.generation.safety_checker_service import safety_checker_service

		assert safety_checker_service is not None

	def test_singleton_is_instance_of_service(self):
		"""Verify singleton is SafetyCheckerService instance."""
		from app.cores.generation.safety_checker_service import (
			SafetyCheckerService,
			safety_checker_service,
		)

		assert isinstance(safety_checker_service, SafetyCheckerService)
