from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import config_crud
from app.database.service import database_service
from app.features.config.service import config_service
from app.schemas.config import ConfigResponse, DeviceRequest, MaxMemoryRequest, SafetyCheckRequest

config = APIRouter(prefix='/config', tags=['config'])


@config.get('/', response_model=ConfigResponse)
def get_config(db: Session = Depends(database_service.get_db)) -> ConfigResponse:
	"""Returns application configuration for the frontend."""
	return config_service.get_config(db)


@config.put('/safety-check', response_model=ConfigResponse)
def update_safety_check(request: SafetyCheckRequest, db: Session = Depends(database_service.get_db)) -> ConfigResponse:
	"""Update safety check setting."""
	config_crud.set_safety_check_enabled(db, request.enabled)

	return config_service.get_config(db)


@config.put('/device', response_model=ConfigResponse)
def update_device(request: DeviceRequest, db: Session = Depends(database_service.get_db)) -> ConfigResponse:
	"""Set the active device."""
	return config_service.set_device(db, request.device_index)


@config.put('/max-memory', response_model=ConfigResponse)
def update_max_memory(request: MaxMemoryRequest, db: Session = Depends(database_service.get_db)) -> ConfigResponse:
	"""Set memory scale factors."""
	return config_service.set_max_memory(db, request.gpu_scale_factor, request.ram_scale_factor)
