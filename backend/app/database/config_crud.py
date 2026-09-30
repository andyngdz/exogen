"""Database operations for configuration and device management."""

from sqlalchemy.orm import Session

from app.database.models import Config

from .constant import (
	DEFAULT_MAX_GPU_SCALE_FACTOR,
	DEFAULT_MAX_RAM_SCALE_FACTOR,
	DEFAULT_SAFETY_CHECK_ENABLED,
	DeviceSelection,
)


def get_device_index(db: Session) -> int:
	"""Get selected device index from the database.

	Returns the stored device index, or DeviceSelection.NOT_FOUND (-2) if not configured.
	"""
	config = db.query(Config).first()
	return config.device_index if config else DeviceSelection.NOT_FOUND


def add_device_index(db: Session, device_index: int):
	"""Add or update selected device"""

	config = db.query(Config).first()

	if config:
		config.device_index = device_index
	else:
		config = Config(device_index=device_index)
		db.add(config)

	db.commit()

	return config


def add_max_memory(db: Session, ram_scale_factor: float, gpu_scale_factor: float):
	"""Add or update configuration in the database."""
	config = db.query(Config).first()

	if config:
		config.ram_scale_factor = ram_scale_factor
		config.gpu_scale_factor = gpu_scale_factor
	else:
		config = Config(ram_scale_factor=ram_scale_factor, gpu_scale_factor=gpu_scale_factor)
		db.add(config)

	db.commit()

	return config


def get_gpu_scale_factor(db: Session) -> float:
	"""Get GPU max factor from the database."""

	config = db.query(Config).first()

	if config and config.gpu_scale_factor is not None:
		return config.gpu_scale_factor

	return DEFAULT_MAX_GPU_SCALE_FACTOR


def get_ram_scale_factor(db: Session) -> float:
	"""Get RAM max factor from the database."""

	config = db.query(Config).first()

	if config and config.ram_scale_factor is not None:
		return config.ram_scale_factor

	return DEFAULT_MAX_RAM_SCALE_FACTOR


def get_safety_check_enabled(db: Session) -> bool:
	"""Get safety check enabled setting from the database."""
	config = db.query(Config).first()

	if config and config.safety_check_enabled is not None:
		return config.safety_check_enabled

	return DEFAULT_SAFETY_CHECK_ENABLED


def set_safety_check_enabled(db: Session, enabled: bool) -> bool:
	"""Set safety check enabled setting in the database.

	Returns:
		The new enabled value, or default if no config exists.
	"""
	config = db.query(Config).first()

	if not config:
		return DEFAULT_SAFETY_CHECK_ENABLED

	config.safety_check_enabled = enabled
	db.commit()

	return config.safety_check_enabled
