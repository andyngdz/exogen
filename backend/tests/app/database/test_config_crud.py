"""Tests for the database config_crud module."""

from unittest.mock import MagicMock

from sqlalchemy.orm import Session

from app.database.config_crud import (
	add_device_index,
	add_max_memory,
	get_device_index,
	get_gpu_scale_factor,
	get_ram_scale_factor,
	get_safety_check_enabled,
	set_safety_check_enabled,
)
from app.database.constant import (
	DEFAULT_MAX_GPU_SCALE_FACTOR,
	DEFAULT_MAX_RAM_SCALE_FACTOR,
	DEFAULT_SAFETY_CHECK_ENABLED,
	DeviceSelection,
)
from app.database.models import Config


class TestGetDeviceIndex:
	"""Tests for the get_device_index function."""

	def test_get_device_index_with_config(self):
		"""Test get_device_index when config exists returns stored index."""
		# Arrange
		mock_db = MagicMock(spec=Session)
		mock_query = MagicMock()
		mock_db.query.return_value = mock_query

		mock_config = MagicMock()
		mock_config.device_index = 0
		mock_query.first.return_value = mock_config

		# Act
		result = get_device_index(mock_db)

		# Assert
		assert result == 0
		mock_db.query.assert_called_once_with(Config)
		mock_query.first.assert_called_once()

	def test_get_device_index_without_config_returns_not_found(self):
		"""Test get_device_index when config doesn't exist returns NOT_FOUND."""
		# Arrange
		mock_db = MagicMock(spec=Session)
		mock_query = MagicMock()
		mock_db.query.return_value = mock_query
		mock_query.first.return_value = None

		# Act
		result = get_device_index(mock_db)

		# Assert
		assert result == DeviceSelection.NOT_FOUND
		mock_db.query.assert_called_once_with(Config)
		mock_query.first.assert_called_once()

	def test_get_device_index_returns_negative_index_as_is(self):
		"""Test get_device_index returns negative index without validation."""
		# Arrange
		mock_db = MagicMock(spec=Session)
		mock_query = MagicMock()
		mock_db.query.return_value = mock_query

		mock_config = MagicMock()
		mock_config.device_index = -1  # CPU mode
		mock_query.first.return_value = mock_config

		# Act
		result = get_device_index(mock_db)

		# Assert
		assert result == -1  # Returns as-is, no validation


class TestAddDeviceIndex:
	"""Tests for the add_device_index function."""

	def test_add_device_index_with_existing_config(self):
		"""Test add_device_index when config already exists."""
		# Arrange
		mock_db = MagicMock(spec=Session)
		mock_query = MagicMock()
		mock_db.query.return_value = mock_query

		mock_config = MagicMock()
		mock_query.first.return_value = mock_config

		# Act
		result = add_device_index(mock_db, 2)

		# Assert
		assert result == mock_config
		assert mock_config.device_index == 2
		mock_db.query.assert_called_once_with(Config)
		mock_query.first.assert_called_once()
		mock_db.commit.assert_called_once()
		mock_db.add.assert_not_called()

	def test_add_device_index_without_existing_config(self):
		"""Test add_device_index when config doesn't exist."""
		# Arrange
		mock_db = MagicMock(spec=Session)
		mock_query = MagicMock()
		mock_db.query.return_value = mock_query
		mock_query.first.return_value = None

		# Act
		result = add_device_index(mock_db, 2)

		# Assert
		assert isinstance(result, Config)
		assert result.device_index == 2
		mock_db.query.assert_called_once_with(Config)
		mock_query.first.assert_called_once()
		mock_db.add.assert_called_once()
		mock_db.commit.assert_called_once()


class TestAddMaxMemory:
	"""Tests for the add_max_memory function."""

	def test_add_max_memory_with_existing_config(self):
		"""Test add_max_memory when config already exists."""
		# Arrange
		mock_db = MagicMock(spec=Session)
		mock_query = MagicMock()
		mock_db.query.return_value = mock_query

		mock_config = MagicMock()
		mock_query.first.return_value = mock_config

		# Act
		result = add_max_memory(mock_db, 0.8, 0.7)

		# Assert
		assert result == mock_config
		assert mock_config.ram_scale_factor == 0.8
		assert mock_config.gpu_scale_factor == 0.7
		mock_db.query.assert_called_once_with(Config)
		mock_query.first.assert_called_once()
		mock_db.commit.assert_called_once()
		mock_db.add.assert_not_called()

	def test_add_max_memory_without_existing_config(self):
		"""Test add_max_memory when config doesn't exist."""
		# Arrange
		mock_db = MagicMock(spec=Session)
		mock_query = MagicMock()
		mock_db.query.return_value = mock_query
		mock_query.first.return_value = None

		# Act
		result = add_max_memory(mock_db, 0.8, 0.7)

		# Assert
		assert isinstance(result, Config)
		assert result.ram_scale_factor == 0.8
		assert result.gpu_scale_factor == 0.7
		mock_db.query.assert_called_once_with(Config)
		mock_query.first.assert_called_once()
		mock_db.add.assert_called_once()
		mock_db.commit.assert_called_once()


class TestGetGpuScaleFactor:
	"""Tests for the get_gpu_scale_factor function."""

	def test_get_gpu_scale_factor_with_config(self):
		"""Test get_gpu_scale_factor when config exists with value."""
		# Arrange
		mock_db = MagicMock(spec=Session)
		mock_query = MagicMock()
		mock_db.query.return_value = mock_query

		mock_config = MagicMock()
		mock_config.gpu_scale_factor = 0.75
		mock_query.first.return_value = mock_config

		# Act
		result = get_gpu_scale_factor(mock_db)

		# Assert
		assert result == 0.75
		mock_db.query.assert_called_once_with(Config)
		mock_query.first.assert_called_once()

	def test_get_gpu_scale_factor_with_none_value(self):
		"""Test get_gpu_scale_factor when config exists but value is None."""
		# Arrange
		mock_db = MagicMock(spec=Session)
		mock_query = MagicMock()
		mock_db.query.return_value = mock_query

		mock_config = MagicMock()
		mock_config.gpu_scale_factor = None
		mock_query.first.return_value = mock_config

		# Act
		result = get_gpu_scale_factor(mock_db)

		# Assert
		assert result == DEFAULT_MAX_GPU_SCALE_FACTOR
		mock_db.query.assert_called_once_with(Config)
		mock_query.first.assert_called_once()

	def test_get_gpu_scale_factor_without_config(self):
		"""Test get_gpu_scale_factor when config doesn't exist."""
		# Arrange
		mock_db = MagicMock(spec=Session)
		mock_query = MagicMock()
		mock_db.query.return_value = mock_query
		mock_query.first.return_value = None

		# Act
		result = get_gpu_scale_factor(mock_db)

		# Assert
		assert result == DEFAULT_MAX_GPU_SCALE_FACTOR
		mock_db.query.assert_called_once_with(Config)
		mock_query.first.assert_called_once()


class TestGetRamScaleFactor:
	"""Tests for the get_ram_scale_factor function."""

	def test_get_ram_scale_factor_with_config(self):
		"""Test get_ram_scale_factor when config exists with value."""
		# Arrange
		mock_db = MagicMock(spec=Session)
		mock_query = MagicMock()
		mock_db.query.return_value = mock_query

		mock_config = MagicMock()
		mock_config.ram_scale_factor = 0.85
		mock_config.gpu_scale_factor = 0.65  # Different value to detect incorrect return
		mock_query.first.return_value = mock_config

		# Act
		result = get_ram_scale_factor(mock_db)

		# Assert
		assert result == 0.85  # Now correctly returns ram_scale_factor
		mock_db.query.assert_called_once_with(Config)
		mock_query.first.assert_called_once()

	def test_get_ram_scale_factor_with_none_value(self):
		"""Test get_ram_scale_factor when config exists but value is None."""
		# Arrange
		mock_db = MagicMock(spec=Session)
		mock_query = MagicMock()
		mock_db.query.return_value = mock_query

		mock_config = MagicMock()
		mock_config.ram_scale_factor = None
		mock_query.first.return_value = mock_config

		# Act
		result = get_ram_scale_factor(mock_db)

		# Assert
		assert result == DEFAULT_MAX_RAM_SCALE_FACTOR
		mock_db.query.assert_called_once_with(Config)
		mock_query.first.assert_called_once()

	def test_get_ram_scale_factor_without_config(self):
		"""Test get_ram_scale_factor when config doesn't exist."""
		# Arrange
		mock_db = MagicMock(spec=Session)
		mock_query = MagicMock()
		mock_db.query.return_value = mock_query
		mock_query.first.return_value = None

		# Act
		result = get_ram_scale_factor(mock_db)

		# Assert
		assert result == DEFAULT_MAX_RAM_SCALE_FACTOR
		mock_db.query.assert_called_once_with(Config)
		mock_query.first.assert_called_once()


class TestGetSafetyCheckEnabled:
	"""Tests for the get_safety_check_enabled function."""

	def test_get_safety_check_enabled_with_config_true(self):
		"""Test get_safety_check_enabled when config exists with True."""
		mock_db = MagicMock(spec=Session)
		mock_query = MagicMock()
		mock_db.query.return_value = mock_query

		mock_config = MagicMock()
		mock_config.safety_check_enabled = True
		mock_query.first.return_value = mock_config

		result = get_safety_check_enabled(mock_db)

		assert result is True
		mock_db.query.assert_called_once_with(Config)

	def test_get_safety_check_enabled_with_config_false(self):
		"""Test get_safety_check_enabled when config exists with False."""
		mock_db = MagicMock(spec=Session)
		mock_query = MagicMock()
		mock_db.query.return_value = mock_query

		mock_config = MagicMock()
		mock_config.safety_check_enabled = False
		mock_query.first.return_value = mock_config

		result = get_safety_check_enabled(mock_db)

		assert result is False

	def test_get_safety_check_enabled_with_none_value(self):
		"""Test get_safety_check_enabled when config exists but value is None."""
		mock_db = MagicMock(spec=Session)
		mock_query = MagicMock()
		mock_db.query.return_value = mock_query

		mock_config = MagicMock()
		mock_config.safety_check_enabled = None
		mock_query.first.return_value = mock_config

		result = get_safety_check_enabled(mock_db)

		assert result == DEFAULT_SAFETY_CHECK_ENABLED

	def test_get_safety_check_enabled_without_config(self):
		"""Test get_safety_check_enabled when config doesn't exist."""
		mock_db = MagicMock(spec=Session)
		mock_query = MagicMock()
		mock_db.query.return_value = mock_query
		mock_query.first.return_value = None

		result = get_safety_check_enabled(mock_db)

		assert result == DEFAULT_SAFETY_CHECK_ENABLED


class TestSetSafetyCheckEnabled:
	"""Tests for the set_safety_check_enabled function."""

	def test_set_safety_check_enabled_with_existing_config(self):
		"""Test set_safety_check_enabled when config exists."""
		mock_db = MagicMock(spec=Session)
		mock_query = MagicMock()
		mock_db.query.return_value = mock_query

		mock_config = MagicMock()
		mock_config.safety_check_enabled = True
		mock_query.first.return_value = mock_config

		result = set_safety_check_enabled(mock_db, False)

		assert mock_config.safety_check_enabled is False
		mock_db.commit.assert_called_once()
		assert result is False

	def test_set_safety_check_enabled_without_config(self):
		"""Test set_safety_check_enabled when config doesn't exist returns default."""
		mock_db = MagicMock(spec=Session)
		mock_query = MagicMock()
		mock_db.query.return_value = mock_query
		mock_query.first.return_value = None

		result = set_safety_check_enabled(mock_db, False)

		assert result == DEFAULT_SAFETY_CHECK_ENABLED
		mock_db.commit.assert_not_called()
