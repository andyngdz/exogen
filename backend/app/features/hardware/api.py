"""Hardware Router - GPU detection and status (read-only)."""

from fastapi import APIRouter

from .service import hardware_service

hardware = APIRouter(
	prefix='/hardware',
	tags=['hardware'],
)


@hardware.get('/')
def get_hardware():
	"""
	Returns the current GPU and driver status of the system.
	This will return the cached result of GPU detection.
	"""
	driver_info = hardware_service.get_gpu_info()

	return driver_info


@hardware.get('/recheck')
def recheck():
	"""
	Forces the backend to re-evaluate and update the GPU and driver status.
	This clears the cache and re-runs GPU detection.
	"""
	driver_info = hardware_service.recheck_gpu_info()

	return driver_info
