"""Main entry point for the Exogen Backend application."""

import asyncio
import os
from contextlib import asynccontextmanager

# Configure PyTorch memory allocator BEFORE importing torch (critical for memory management)
# This reduces GPU memory fragmentation which causes OOM errors
os.environ['PYTORCH_CUDA_ALLOC_CONF'] = 'expandable_segments:True'

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware

from app.cores.model_manager import model_manager
from app.database import database_service
from app.database.service import SessionLocal
from app.features.config import config
from app.features.downloads import downloads
from app.features.generators import generators
from app.features.hardware import hardware
from app.features.histories import histories
from app.features.img2img import img2img
from app.features.loras import loras
from app.features.models import models
from app.features.resizes import resizes
from app.features.styles import styles
from app.features.users import users
from app.services import logger_service, platform_service, storage_service
from app.socket import socket_service
from config import STATIC_FOLDER


@asynccontextmanager
async def lifespan(app: FastAPI):
	"""Startup event"""

	logger_service.init()
	storage_service.init()
	platform_service.init()
	database_service.init()

	# Attach the running ASGI loop to the socket service for thread-safe emits
	socket_service.attach_loop(asyncio.get_running_loop())

	db = SessionLocal()
	await model_manager.unload_model_async()

	yield

	model_manager.loader_service.shutdown()
	db.close()


fastapi_app = FastAPI(
	description='Backend for Local AI operations.',
	title='Exogen Backend',
	version='0.1.0',
	lifespan=lifespan,
)
fastapi_app.mount('/static', StaticFiles(directory='static'), name='static')
fastapi_app.mount('/socket.io', app=socket_service.sio_app)
fastapi_app.include_router(users)
fastapi_app.include_router(models)
fastapi_app.include_router(loras)
fastapi_app.include_router(downloads)
fastapi_app.include_router(hardware)
fastapi_app.include_router(generators)
fastapi_app.include_router(img2img)
fastapi_app.include_router(styles)
fastapi_app.include_router(histories)
fastapi_app.include_router(resizes)
fastapi_app.include_router(config)


@fastapi_app.get('/favicon.ico')
async def favicon():
	static_folder = STATIC_FOLDER
	favicon_path = os.path.join(static_folder, 'favicon.ico')
	return FileResponse(favicon_path, media_type='image/vnd.microsoft.icon')


@fastapi_app.get('/')
def health_check():
	"""Health check endpoint to verify if the server is running."""
	return {'status': 'healthy', 'message': 'Exogen Backend is running!'}


# Wrap with CORS middleware to ensure headers on all responses including errors
app = CORSMiddleware(
	app=fastapi_app,
	allow_origins=['*'],
	allow_credentials=True,
	allow_methods=['*'],
	allow_headers=['*'],
)
