import psutil
import torch
from sqlalchemy.orm import Session

from app.database.config_crud import get_device_index
from app.services.device import device_service

GPU_MEMORY_ESTIMATE_FACTOR = 0.8


class MemoryService:
	def __init__(self, db: Session):
		device_index = get_device_index(db)
		total_ram = psutil.virtual_memory().total

		self.total_ram = total_ram

		# Get GPU memory based on device type
		if device_service.is_cuda and device_index >= 0:
			properties = torch.cuda.get_device_properties(device_index)
			self.total_gpu = properties.total_memory
		elif device_service.is_mps:
			# For MPS, we'll use a conservative estimate of available memory
			# Apple Silicon Macs share memory between CPU and GPU
			# Use 80% of system RAM as available GPU memory estimate
			self.total_gpu = int(total_ram * GPU_MEMORY_ESTIMATE_FACTOR)
		else:
			# CPU-only, no dedicated GPU memory, or invalid device index
			self.total_gpu = 0
