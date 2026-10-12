"""Histories Table"""

from typing import Any

from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin


class History(Base, TimestampMixin):
	"""Histories"""

	__tablename__ = 'histories'

	id: Mapped[int] = mapped_column(primary_key=True, index=True)
	prompt: Mapped[str] = mapped_column()
	model: Mapped[str] = mapped_column()
	config: Mapped[dict[str, Any]] = mapped_column()
	generated_images = relationship('GeneratedImage', back_populates='history', cascade='all, delete-orphan')

	def __repr__(self):
		return (
			f"<History(prompt='{self.prompt}', model='{self.model}', "
			f"config='{self.config}', generated_images='{self.generated_images}', "
			f"created_at='{self.created_at}', updated_at='{self.updated_at}')>"
		)
