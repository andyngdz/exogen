from typing import Dict, Union

from sqlalchemy.orm import Session

from app.constants.max_memory import BYTES_TO_GB
from app.database.config_crud import get_device_index, get_gpu_scale_factor, get_ram_scale_factor
from app.services import MemoryService, device_service


class MaxMemoryConfig:
	def __init__(self, db: Session):
		"""
		device: 'cuda' or 'cpu'
		device_index: index of the CUDA device (default 0)
		max_ram: string representation of max RAM memory
		max_gpu: string representation of max GPU memory
		"""
		memory_service = MemoryService(db)
		max_gpu_factor = get_gpu_scale_factor(db)
		max_ram_factor = get_ram_scale_factor(db)

		self.device_index = get_device_index(db)
		self.max_ram = (memory_service.total_ram * max_ram_factor) / BYTES_TO_GB
		self.max_gpu = (memory_service.total_gpu * max_gpu_factor) / BYTES_TO_GB

	def to_dict(self) -> Dict[Union[int, str], str]:
		if device_service.is_cuda:
			return {
				self.device_index: f'{self.max_gpu}GB',
				'cpu': f'{self.max_ram}GB',
			}
		elif device_service.is_mps:
			# For MPS, we specify memory for the 'mps' device
			return {
				'mps': f'{self.max_gpu}GB',
				'cpu': f'{self.max_ram}GB',
			}
		else:
			return {'cpu': f'{self.max_ram}GB'}
