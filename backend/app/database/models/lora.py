"""LoRAs Table"""

from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin


class LoRA(Base, TimestampMixin):
	"""LoRAs"""

	__tablename__ = 'loras'

	id: Mapped[int] = mapped_column(primary_key=True, index=True)
	name: Mapped[str] = mapped_column()
	file_path: Mapped[str] = mapped_column(unique=True)
	file_size: Mapped[int] = mapped_column()

	def __repr__(self):
		return (
			f"<LoRA(id={self.id}, name='{self.name}', file_path='{self.file_path}', "
			f"file_size={self.file_size}, created_at='{self.created_at}', updated_at='{self.updated_at}')>"
		)
