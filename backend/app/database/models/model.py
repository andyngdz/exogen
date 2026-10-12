"""Models Table"""

from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin


class Model(Base, TimestampMixin):
	"""Models"""

	__tablename__ = 'models'

	id: Mapped[int] = mapped_column(primary_key=True, index=True)
	model_id: Mapped[str] = mapped_column(unique=True)
	model_dir: Mapped[str] = mapped_column(unique=True)

	def __repr__(self):
		return (
			f"<Model(model_id='{self.model_id}', model_dir='{self.model_dir}', "
			f"created_at='{self.created_at}', updated_at='{self.updated_at}')>"
		)
