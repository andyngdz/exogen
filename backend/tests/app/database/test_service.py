"""Tests for database service migration functionality."""

import os
from unittest.mock import MagicMock, patch

import pytest

from app.database.service import DatabaseService, get_alembic_ini_path, run_migrations


class TestGetAlembicIniPath:
	"""Tests for get_alembic_ini_path function."""

	def test_returns_absolute_path(self):
		"""Test that path resolution returns an absolute path."""
		result = get_alembic_ini_path()

		assert os.path.isabs(result)

	def test_path_ends_with_alembic_ini(self):
		"""Test that the resolved path ends with alembic.ini."""
		result = get_alembic_ini_path()

		assert result.endswith('alembic.ini')

	def test_path_exists_in_project(self):
		"""Test that the resolved path actually exists."""
		result = get_alembic_ini_path()

		assert os.path.exists(result)

	def test_path_is_in_project_root(self):
		"""Test that alembic.ini is in project root (two levels up from database module)."""
		result = get_alembic_ini_path()

		project_root = os.path.dirname(result)
		assert os.path.exists(os.path.join(project_root, 'app'))
		assert os.path.exists(os.path.join(project_root, 'alembic'))


class TestRunMigrations:
	"""Tests for run_migrations function."""

	@patch('app.database.service.command')
	@patch('app.database.service.Config')
	@patch('app.database.service.get_alembic_ini_path')
	@patch('app.database.service.os.path.exists')
	def test_runs_upgrade_to_head(self, mock_exists, mock_get_path, mock_config, mock_command):
		"""Test that migrations run upgrade to head (happy path)."""
		mock_exists.return_value = True
		mock_get_path.return_value = '/fake/path/alembic.ini'
		mock_alembic_cfg = MagicMock()
		mock_config.return_value = mock_alembic_cfg

		run_migrations()

		mock_config.assert_called_once_with('/fake/path/alembic.ini')
		mock_command.upgrade.assert_called_once_with(mock_alembic_cfg, 'head')

	@patch('app.database.service.get_alembic_ini_path')
	@patch('app.database.service.os.path.exists')
	def test_raises_when_config_not_found(self, mock_exists, mock_get_path):
		"""Test that FileNotFoundError is raised when alembic.ini doesn't exist (error case)."""
		mock_exists.return_value = False
		mock_get_path.return_value = '/nonexistent/alembic.ini'

		with pytest.raises(FileNotFoundError, match='Alembic configuration not found'):
			run_migrations()


class TestDatabaseServiceInit:
	"""Tests for DatabaseService.init method."""

	@patch('app.database.service.run_migrations')
	@patch('app.database.service.logger')
	def test_init_runs_migrations_successfully(self, mock_logger, mock_run_migrations):
		"""Test successful initialization runs migrations (happy path)."""
		service = DatabaseService()

		service.init()

		mock_run_migrations.assert_called_once()
		mock_logger.info.assert_called_once_with('Database migrations applied successfully.')

	@patch('app.database.service.run_migrations')
	@patch('app.database.service.logger')
	def test_init_propagates_file_not_found_error(self, mock_logger, mock_run_migrations):
		"""Test that FileNotFoundError is logged and re-raised (error case)."""
		mock_run_migrations.side_effect = FileNotFoundError('Config not found')
		service = DatabaseService()

		with pytest.raises(FileNotFoundError):
			service.init()

		mock_logger.error.assert_called_once()
		assert 'Migration configuration error' in str(mock_logger.error.call_args)

	@patch('app.database.service.run_migrations')
	@patch('app.database.service.logger')
	def test_init_wraps_generic_errors_in_runtime_error(self, mock_logger, mock_run_migrations):
		"""Test that generic exceptions are wrapped in RuntimeError (error case)."""
		mock_run_migrations.side_effect = Exception('Database connection failed')
		service = DatabaseService()

		with pytest.raises(RuntimeError, match='Failed to apply database migrations'):
			service.init()

		mock_logger.error.assert_called_once()
		assert 'Database migration failed' in str(mock_logger.error.call_args)
