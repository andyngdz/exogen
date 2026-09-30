"""Models Router"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from huggingface_hub import HfApi
from sqlalchemy.orm import Session

from app.cores.model_loader.cancellation import CancellationException, DuplicateLoadRequestError
from app.cores.model_manager import ModelState, model_manager
from app.database import database_service
from app.schemas.models import (
	LoadModelRequest,
	LoadModelResponse,
	ModelAvailableResponse,
	ModelSearchInfo,
	ModelSearchInfoListResponse,
)
from app.schemas.responses import JSONResponseMessage
from app.services import logger_service
from app.services.models import model_service

from .recommendations import ModelRecommendationService

logger = logger_service.get_logger(__name__, category='API')
models = APIRouter(
	prefix='/models',
	tags=['models'],
)
api = HfApi()


@models.get('/search')
def list_models(
	model_name: Optional[str] = Query(
		default=None,
		description='Model name to search for',
	),
	filter: Optional[str] = Query(default=None, description='Filter for models'),
	limit: int = Query(default=20, description='Number of models to return'),
	sort: Optional[str] = Query(default='likes', description='Sort order for models'),
):
	"""List models from Hugging Face Hub."""

	hf_models_generator = api.list_models(
		full=True,
		filter=filter,
		limit=limit,
		model_name=model_name,
		pipeline_tag='text-to-image',
		sort=sort,
	)

	models = list(hf_models_generator)
	models_search_info = []

	for model in models:
		model_search_info = ModelSearchInfo(**model.__dict__)
		models_search_info.append(model_search_info)

	return ModelSearchInfoListResponse(models_search_info=models_search_info)


@models.get('/details')
def get_model_info(model_id: str = Query(..., description='Model ID')):
	"""Get model info by model's id"""
	if not model_id:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail="Missing 'model_id' query parameter",
		)

	model_info = api.model_info(model_id, files_metadata=True)

	return model_info


@models.get('/downloaded')
def get_downloaded_models(db: Session = Depends(database_service.get_db)):
	"""Get a list of downloaded models"""
	try:
		models = model_service.get_downloaded_models(db)

		return models
	except Exception as error:
		logger.exception('Failed to fetch available models')

		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=str(error),
		)


@models.get('/available')
def is_model_available(
	model_id: str = Query(..., description='Model ID'),
	db: Session = Depends(database_service.get_db),
):
	"""Check if model is already downloaded by id"""

	try:
		is_downloaded = model_service.is_model_downloaded(db, model_id)

		return ModelAvailableResponse(model_id=model_id, is_downloaded=is_downloaded)
	except Exception as error:
		logger.exception('Failed to check if model is downloaded')

		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=str(error),
		)


@models.post('/load')
async def load_model(request: LoadModelRequest):
	"""Load model by id"""
	model_id = None

	try:
		model_id = request.model_id

		config = await model_manager.load_model_async(model_id)
		sample_size = model_manager.sample_size
		family = model_manager.loaded_model_family

		return LoadModelResponse(model_id=model_id, config=config, sample_size=sample_size, family=family)

	except CancellationException:
		# Model loading was cancelled (expected behavior during React double-mount)
		logger.info(f'Model load cancelled for {model_id}')
		return Response(status_code=204)  # No Content

	except DuplicateLoadRequestError:
		# Same model is already loading, skip the duplicate request
		logger.info(f'Model {model_id} is already loading, skipping duplicate request')
		return Response(status_code=204)  # No Content

	except FileNotFoundError as error:
		logger.error(f'Model file not found for {model_id}: {error}')

		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail=f"Model files not found for ID '{model_id}'. {error}",
		)
	except Exception as error:
		logger.exception(f'Failed to load model {model_id}')

		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Failed to load model '{model_id}': {error}",
		)


@models.get('/recommendations')
def get_model_recommendations(db: Session = Depends(database_service.get_db)):
	"""Get model recommendations based on hardware capabilities"""

	try:
		model_recommendation_service = ModelRecommendationService(db)
		recommendations = model_recommendation_service.get_recommendations()

		logger.info(f'Generated {len(recommendations.sections)} recommendation sections')

		return recommendations

	except Exception as error:
		logger.exception('Failed to generate model recommendations')

		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f'Failed to generate model recommendations: {error}',
		)


@models.post('/unload')
async def unload_model():
	"""
	Unloads the current model from memory (async version with cancellation support).

	This endpoint can cancel in-progress model loads before unloading.
	Safe to call during React useEffect cleanup.
	"""

	try:
		await model_manager.unload_model_async()

		return JSONResponseMessage(message='Model unloaded successfully')
	except Exception as error:
		logger.exception('Failed to unload model')

		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f'Failed to unload model: {error}',
		)


@models.get('/status')
def get_model_status():
	"""
	Get current model loading status.

	Returns information about currently loaded model, loading state,
	and helps frontend avoid duplicate requests.
	"""

	try:
		state = model_manager.current_state

		response = {
			'state': state.value,
			'loaded_model_id': model_manager.id,
			'has_model': model_manager.has_model,
			'is_loading': state == ModelState.LOADING,
			'loaded_model_family': model_manager.loaded_model_family.value,
		}

		return response

	except Exception as error:
		logger.exception('Failed to get model status')

		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f'Failed to get model status: {error}',
		)


@models.delete('/')
def delete_model_by_id(
	model_id: str = Query(..., description='Model ID to delete'),
	db: Session = Depends(database_service.get_db),
):
	"""
	Delete a model from the system.
	- Checks if the model is currently in use (loaded)
	- Deletes the model files from cache
	- Removes the model entry from the database

	"""

	# Check if the model is currently loaded/in use
	if model_manager.id == model_id:
		raise HTTPException(
			status_code=status.HTTP_409_CONFLICT,
			detail=f"Cannot delete model '{model_id}': Model is currently loaded. Please unload it first.",
		)

	try:
		# Delete the model
		deleted_model_id = model_service.delete_model(db, model_id)

		return JSONResponseMessage(message=f'Model {deleted_model_id} deleted successfully')

	except ValueError as error:
		# Handle model not found or deletion errors
		logger.error(f'Error deleting model {model_id}: {error}')
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail=str(error),
		)
	except Exception as error:
		logger.exception(f'Failed to delete model {model_id}')
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f'Failed to delete model: {error}',
		)
