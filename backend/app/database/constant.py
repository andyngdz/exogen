from enum import IntEnum

DEFAULT_MAX_GPU_SCALE_FACTOR = 0.5
DEFAULT_MAX_RAM_SCALE_FACTOR = 0.5
DEFAULT_SAFETY_CHECK_ENABLED = True

DATABASE_URL = 'sqlite:///exogen_backend.db'


class DeviceSelection(IntEnum):
	NOT_FOUND = -2
