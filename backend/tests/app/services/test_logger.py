"""Tests for the logger service with category support."""

import logging
import os
from unittest.mock import patch

import pytest

from app.services.logger import CategoryAdapter, LoggerService, logger_service


class TestCategoryAdapter:
	"""Test the CategoryAdapter class."""

	def test_category_prefix_added_to_message(self):
		"""Test that category prefix is added to log messages."""
		base_logger = logging.getLogger('test_logger')
		adapter = CategoryAdapter(base_logger, category='TestCategory')

		msg, kwargs = adapter.process('Test message', {})

		assert msg == '[TestCategory] Test message'
		assert kwargs == {}

	def test_category_adapter_preserves_logger_name(self):
		"""Test that CategoryAdapter preserves the underlying logger name."""
		base_logger = logging.getLogger('test.module')
		adapter = CategoryAdapter(base_logger, category='Test')

		assert adapter.logger.name == 'test.module'
		assert adapter.category == 'Test'


class TestLoggerService:
	"""Test the LoggerService class."""

	def test_init_configures_root_logger(self):
		"""Test that init() configures the root logger with a handler."""
		service = LoggerService()
		root_logger = logging.getLogger()

		# Clear existing handlers
		root_logger.handlers.clear()

		service.init()

		# Root logger should have at least one handler after init
		assert len(root_logger.handlers) >= 1
		assert isinstance(root_logger.handlers[0], logging.StreamHandler)

	def test_init_creates_colored_formatter(self):
		"""Test that init() creates a ColoredFormatter with correct format."""
		service = LoggerService()
		root_logger = logging.getLogger()

		service.init()

		# Check that handler has a formatter
		handler = root_logger.handlers[0]
		assert handler.formatter is not None
		# ColoredFormatter should format with log colors
		assert hasattr(handler.formatter, '_fmt')

	def test_init_suppresses_third_party_loggers(self):
		"""Test that init() sets socketio and engineio to WARNING level."""
		service = LoggerService()

		service.init()

		socketio_logger = logging.getLogger('socketio')
		engineio_logger = logging.getLogger('engineio')

		assert socketio_logger.level == logging.WARNING
		assert engineio_logger.level == logging.WARNING

	def test_init_configures_uvicorn_loggers(self):
		"""Test that init() configures uvicorn loggers to propagate."""
		service = LoggerService()

		service.init()

		for logger_name in ['uvicorn', 'uvicorn.access', 'uvicorn.error']:
			uvicorn_logger = logging.getLogger(logger_name)
			assert uvicorn_logger.handlers == []
			assert uvicorn_logger.propagate is True

	def test_init_removes_duplicate_handlers(self):
		"""Test that init() removes existing handlers before adding new ones."""
		service = LoggerService()
		root_logger = logging.getLogger()

		# Add a dummy handler
		dummy_handler = logging.StreamHandler()
		root_logger.addHandler(dummy_handler)

		service.init()

		# After init, should have exactly 1 handler (the new one)
		assert len(root_logger.handlers) == 1
		assert dummy_handler not in root_logger.handlers

	def test_get_logger_returns_category_adapter(self):
		"""Test that get_logger returns a CategoryAdapter instance."""
		service = LoggerService()
		logger = service.get_logger('test.module', category='TestCat')

		assert isinstance(logger, CategoryAdapter)
		assert logger.category == 'TestCat'

	@pytest.mark.parametrize(
		'category',
		['ModelLoad', 'Download', 'Generate', 'API', 'Database', 'Service', 'Socket', 'GPU'],
	)
	def test_all_categories(self, category):
		"""Test that all standard categories work correctly."""
		service = LoggerService()
		logger = service.get_logger('test.module', category=category)

		assert isinstance(logger, CategoryAdapter)
		assert logger.category == category

	def test_module_specific_log_level(self):
		"""Test that module-specific log levels are applied from environment variables."""
		service = LoggerService()

		# Module name conversion: app.test.module -> TEST_MODULE
		with patch.dict(os.environ, {'LOG_LEVEL_TEST_MODULE': 'DEBUG'}):
			logger = service.get_logger('app.test.module', category='Test')

			# The underlying logger should have DEBUG level set
			assert logger.logger.level == logging.DEBUG

	def test_default_log_level_when_no_env_var(self):
		"""Test that logger uses INFO level when no env var is set."""
		service = LoggerService()

		with patch.dict(os.environ, {}, clear=True):
			# Remove all LOG_LEVEL env vars
			env_clean = {k: v for k, v in os.environ.items() if not k.startswith('LOG_LEVEL')}
			with patch.dict(os.environ, env_clean, clear=True):
				logger = service.get_logger('app.test.other', category='Test')

				# Should use INFO as default (root logger level)
				assert logger.logger.level == 0 or logger.logger.level == logging.NOTSET

	def test_get_log_level_with_global_env_var(self):
		"""Test that _get_log_level respects global LOG_LEVEL env var."""
		service = LoggerService()

		with patch.dict(os.environ, {'LOG_LEVEL': 'DEBUG'}):
			log_level = service._get_log_level()
			assert log_level == logging.DEBUG

		with patch.dict(os.environ, {'LOG_LEVEL': 'ERROR'}):
			log_level = service._get_log_level()
			assert log_level == logging.ERROR

	def test_get_log_level_fallback_to_info(self):
		"""Test that _get_log_level falls back to INFO for invalid levels."""
		service = LoggerService()

		with patch.dict(os.environ, {'LOG_LEVEL': 'INVALID_LEVEL'}):
			log_level = service._get_log_level()
			# getattr with default should return INFO for invalid level
			assert log_level == logging.INFO

	def test_get_log_level_with_module_name(self):
		"""Test that _get_log_level uses module-specific env var when module_name provided."""
		service = LoggerService()

		# Test with module-specific env var
		# Module name conversion: app.cores.model_loader -> CORES_MODEL_LOADER
		with patch.dict(os.environ, {'LOG_LEVEL_CORES_MODEL_LOADER': 'WARNING', 'LOG_LEVEL': 'DEBUG'}):
			# Should use module-specific level, not global
			log_level = service._get_log_level(module_name='app.cores.model_loader')
			assert log_level == logging.WARNING

		# Test without module-specific env var - should fall back to global
		with patch.dict(os.environ, {'LOG_LEVEL': 'ERROR'}):
			log_level = service._get_log_level(module_name='app.cores.model_loader')
			assert log_level == logging.ERROR

	def test_get_logger_with_non_app_module_name(self):
		"""Test get_logger with module name without 'app.' prefix."""
		service = LoggerService()

		# Module name without 'app.' prefix
		logger = service.get_logger('test.module', category='Test')

		assert isinstance(logger, CategoryAdapter)
		assert logger.logger.name == 'test.module'

	def test_get_logger_with_invalid_log_level_env_var(self):
		"""Test get_logger with invalid module-specific log level falls back to INFO."""
		service = LoggerService()

		with patch.dict(os.environ, {'LOG_LEVEL_TEST_MODULE': 'INVALID'}):
			logger = service.get_logger('app.test.module', category='Test')

			# Should fall back to INFO for invalid log level
			# Logger might have NOTSET if no level set, or default from root
			assert logger.logger.level in [0, logging.INFO, logging.NOTSET]

	def test_get_logger_module_name_conversion(self):
		"""Test that module names are correctly converted for env var lookup."""
		service = LoggerService()

		# Test with 'app.' prefix - should be removed
		with patch.dict(os.environ, {'LOG_LEVEL_CORES_MODEL_LOADER': 'WARNING'}):
			logger = service.get_logger('app.cores.model_loader', category='ModelLoad')
			assert logger.logger.level == logging.WARNING

		# Test conversion of dots to underscores
		with patch.dict(os.environ, {'LOG_LEVEL_FEATURES_DOWNLOADS_API': 'ERROR'}):
			logger = service.get_logger('app.features.downloads.api', category='Download')
			assert logger.logger.level == logging.ERROR


class TestFormatConfig:
	"""Test format_config method."""

	def test_format_config_with_pydantic_model(self):
		"""Test format_config with Pydantic BaseModel."""
		from pydantic import BaseModel

		class TestConfig(BaseModel):
			width: int = 512
			height: int = 512
			steps: int = 20

		service = LoggerService()
		config = TestConfig()
		result = service.format_config(config)

		assert '"width": 512' in result
		assert '"height": 512' in result
		assert '"steps": 20' in result

	def test_format_config_with_dict(self):
		"""Test format_config with dictionary."""
		service = LoggerService()
		config = {'name': 'test', 'value': 123}
		result = service.format_config(config)

		assert '"name": "test"' in result
		assert '"value": 123' in result

	def test_format_config_with_object(self):
		"""Test format_config with object having __dict__."""
		service = LoggerService()

		class SimpleObject:
			def __init__(self):
				self.field1 = 'value1'
				self.field2 = 42

		config = SimpleObject()
		result = service.format_config(config)

		assert '"field1": "value1"' in result
		assert '"field2": 42' in result

	def test_format_config_with_primitive(self):
		"""Test format_config with primitive value wraps in dict."""
		service = LoggerService()
		result = service.format_config('simple string')

		assert '"value": "simple string"' in result

	def test_format_config_returns_json_string(self):
		"""Test that format_config returns valid JSON string."""
		import json

		service = LoggerService()
		config = {'key': 'value'}
		result = service.format_config(config)

		parsed = json.loads(result)
		assert parsed == {'key': 'value'}

	def test_format_config_handles_non_serializable(self):
		"""Test format_config handles non-JSON-serializable values via default=str."""
		from datetime import datetime

		service = LoggerService()
		config = {'timestamp': datetime(2024, 1, 15, 12, 0, 0)}
		result = service.format_config(config)

		assert '2024-01-15' in result


class TestLoggerIntegration:
	"""Integration tests for logger service."""

	def test_logger_service_singleton(self):
		"""Test that logger_service is a singleton instance."""
		assert isinstance(logger_service, LoggerService)

	def test_logger_with_all_categories_integration(self, caplog):
		"""Test that loggers with different categories work in integration."""
		categories = ['ModelLoad', 'Download', 'Generate', 'API', 'Database', 'Service', 'Socket', 'GPU']

		with caplog.at_level(logging.INFO):
			for category in categories:
				logger = logger_service.get_logger(f'test.{category.lower()}', category=category)
				logger.info(f'Testing {category}')

		# Verify log messages contain category prefixes
		for category in categories:
			assert any(f'[{category}] Testing {category}' in record.message for record in caplog.records)

	def test_category_adapter_with_different_log_levels(self, caplog):
		"""Test that CategoryAdapter works with different log levels."""
		logger = logger_service.get_logger('test.levels', category='Test')

		with caplog.at_level(logging.DEBUG):
			logger.debug('Debug message')
			logger.info('Info message')
			logger.warning('Warning message')
			logger.error('Error message')

		messages = [record.message for record in caplog.records]

		assert '[Test] Debug message' in messages
		assert '[Test] Info message' in messages
		assert '[Test] Warning message' in messages
		assert '[Test] Error message' in messages

	def test_logger_inherits_root_configuration(self):
		"""Test that loggers created after init() inherit root configuration."""
		# The logger_service.init() should have been called in main.py
		# Our loggers should inherit from the configured root logger

		logger_service.get_logger('test.inheritance', category='Test')

		# Should have the same handlers as root or inherit through propagation
		root_logger = logging.getLogger()
		assert len(root_logger.handlers) > 0  # Root should have handlers from init()
