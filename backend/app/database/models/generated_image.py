"""Generated Images Table"""

from sqlalchemy import ForeignKey, false
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin


class GeneratedImage(Base, TimestampMixin):
	"""Generated Images"""

	__tablename__ = 'generated_images'

	id: Mapped[int] = mapped_column(primary_key=True, index=True)
	history_id: Mapped[int] = mapped_column(ForeignKey('histories.id'))
	path: Mapped[str] = mapped_column()
	file_name: Mapped[str] = mapped_column()
	is_nsfw: Mapped[bool] = mapped_column(server_default=false())
	history = relationship('History', back_populates='generated_images')

	def __repr__(self):
		return (
			f"<GeneratedImage(history_id='{self.history_id}', path='{self.path}', "
			f"created_at='{self.created_at}', updated_at='{self.updated_at}')>"
		)
