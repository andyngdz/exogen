"""Config Table"""

from sqlalchemy import true
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin
from app.database.constant import DEFAULT_MAX_GPU_SCALE_FACTOR, DEFAULT_MAX_RAM_SCALE_FACTOR


class Config(Base, TimestampMixin):
	"""Config"""

	__tablename__ = 'config'

	id: Mapped[int] = mapped_column(primary_key=True, index=True)
	device_index: Mapped[int] = mapped_column()
	ram_scale_factor: Mapped[float] = mapped_column(default=DEFAULT_MAX_RAM_SCALE_FACTOR)
	gpu_scale_factor: Mapped[float] = mapped_column(default=DEFAULT_MAX_GPU_SCALE_FACTOR)
	safety_check_enabled: Mapped[bool] = mapped_column(server_default=true())

	def __repr__(self):
		return (
			f'<Config(id={self.id}, device_index={self.device_index}, '
			f'ram_scale_factor={self.ram_scale_factor}, gpu_scale_factor={self.gpu_scale_factor}, '
			f'safety_check_enabled={self.safety_check_enabled}, '
			f'created_at={self.created_at}, updated_at={self.updated_at})>'
		)
