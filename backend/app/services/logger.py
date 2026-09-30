import json
import logging
import os
from typing import Any, MutableMapping, Optional

import colorlog
from pydantic import BaseModel
from typing_extensions import override


class CategoryAdapter(logging.LoggerAdapter[logging.Logger]):
	"""Logger adapter that prepends category prefix to messages."""

	def __init__(self, logger: logging.Logger, category: str):
		super().__init__(logger, {})
		self.category = category

	@override
	def process(self, msg: str, kwargs: MutableMapping[str, Any]) -> tuple[str, MutableMapping[str, Any]]:
		"""Add category prefix to the message."""
		return f'[{self.category}] {msg}', kwargs


class LoggerService:
	"""Centralized logging service with colored console output and category support.

	Features:
	- Colored log levels (ERROR=red, WARNING=yellow, INFO=green, DEBUG=cyan)
	- Category prefixes for grouping related messages
	- Environment variable configuration (LOG_LEVEL, LOG_LEVEL_<module>)
	- Separate loggers per module for fine-grained control
	"""

	def _get_log_level(self, module_name: Optional[str] = None) -> int:
		"""Get log level from environment variables.

		Args:
			module_name: Optional module name for module-specific log level

		Returns:
			Log level integer (DEBUG, INFO, WARNING, ERROR)
		"""
		# Check module-specific log level first
		if module_name:
			# Convert module name to env var format: app.cores.model_loader -> MODEL_LOADER
			env_module = module_name.replace('app.', '').replace('.', '_').upper()
			module_level = os.environ.get(f'LOG_LEVEL_{env_module}')
			if module_level:
				return getattr(logging, module_level.upper(), logging.INFO)

		# Fall back to global log level
		global_level = os.environ.get('LOG_LEVEL', 'INFO')
		return getattr(logging, global_level.upper(), logging.INFO)

	def init(self):
		"""Initialize root logger with colored formatting.

		This should be called once during application startup.
		"""

		# Color scheme for log levels
		log_colors = {
			'DEBUG': 'cyan',
			'INFO': 'green',
			'WARNING': 'yellow',
			'ERROR': 'red',
			'CRITICAL': 'red,bold',
		}

		# Enhanced format with colors
		# Format: [LEVEL] timestamp  message
		# Entire line colored based on log level
		formatter = colorlog.ColoredFormatter(
			'%(log_color)s[%(levelname)s] %(asctime)s  %(message)s%(reset)s',
			datefmt='%Y-%m-%d %H:%M:%S',
			log_colors=log_colors,
			reset=True,
			style='%',
		)

		# Configure root logger
		root_logger = logging.getLogger()
		root_logger.setLevel(self._get_log_level())

		# Remove existing handlers to avoid duplicates
		for handler in root_logger.handlers[:]:
			root_logger.removeHandler(handler)

		# Console handler with colored formatter
		console_handler = logging.StreamHandler()
		console_handler.setFormatter(formatter)
		root_logger.addHandler(console_handler)

		# Suppress verbose third-party loggers
		logging.getLogger('socketio').setLevel(logging.WARNING)
		logging.getLogger('engineio').setLevel(logging.WARNING)

		# Apply our formatter to uvicorn loggers for consistency
		# Remove uvicorn's default handlers so it inherits our colored formatter
		for logger_name in ['uvicorn', 'uvicorn.access', 'uvicorn.error']:
			uvicorn_logger = logging.getLogger(logger_name)
			uvicorn_logger.handlers = []
			uvicorn_logger.propagate = True

	def get_logger(self, name: str, category: str) -> CategoryAdapter:
		"""Get a logger instance with category prefix.

		Args:
			name: Logger name (typically __name__ of the module)
			category: Category prefix (e.g., 'ModelLoad', 'Download', 'Database')

		Returns:
			CategoryAdapter instance with category prefix

		Example:
			>>> logger = logger_service.get_logger(__name__, category='ModelLoad')
			>>> logger.info('Loading model...')  # Output: [INFO] ... [ModelLoad] Loading model...
		"""
		logger = logging.getLogger(name)

		# Apply module-specific log level if configured
		env_module = name.replace('app.', '').replace('.', '_').upper()
		module_level_str = os.environ.get(f'LOG_LEVEL_{env_module}')
		if module_level_str:
			logger.setLevel(getattr(logging, module_level_str.upper(), logging.INFO))

		return CategoryAdapter(logger, category)

	def format_config(self, config: object) -> str:
		"""Format config object as JSON for logging.

		Args:
			config: Object with attributes or dict to format

		Returns:
			JSON formatted string with line breaks

		Example:
			>>> logger_service.format_config(config)
			'{"width": 512, "height": 512, "steps": 20}'
		"""
		if isinstance(config, BaseModel):
			data = config.model_dump()
		elif hasattr(config, '__dict__'):
			data = config.__dict__
		else:
			data = dict(config) if isinstance(config, dict) else {'value': config}

		return json.dumps(data, indent=2, default=str)


logger_service = LoggerService()
