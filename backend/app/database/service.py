import os

from alembic.config import Config
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from alembic import command
from app.services import logger_service

from .constant import DATABASE_URL

logger = logger_service.get_logger(__name__, category='Database')

# Create the SQLAlchemy engine
# echo=True is useful for debugging SQL queries, set to False in production
engine = create_engine(DATABASE_URL, echo=False)

# Create a SessionLocal class, which is a factory for new Session objects
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_alembic_ini_path() -> str:
	"""Resolve alembic.ini path relative to module location."""
	script_dir = os.path.dirname(os.path.abspath(__file__))
	project_root = os.path.dirname(os.path.dirname(script_dir))
	return os.path.join(project_root, 'alembic.ini')


def run_migrations() -> None:
	"""Run Alembic migrations to head."""
	alembic_ini_path = get_alembic_ini_path()

	if not os.path.exists(alembic_ini_path):
		raise FileNotFoundError(f'Alembic configuration not found at {alembic_ini_path}')

	alembic_cfg = Config(alembic_ini_path)
	command.upgrade(alembic_cfg, 'head')


class DatabaseService:
	"""
	Base class for database services.
	Provides common functionality for database operations.
	"""

	@property
	def db(self):
		return self.get_db()

	def init(self):
		"""
		Initializes the database by running Alembic migrations.
		This should be called only once, typically on application startup.
		"""
		try:
			run_migrations()
			logger.info('Database migrations applied successfully.')
		except FileNotFoundError as error:
			logger.error(f'Migration configuration error: {error}')
			raise
		except Exception as error:
			logger.error(f'Database migration failed: {error}')
			raise RuntimeError(f'Failed to apply database migrations: {error}') from error

	def get_db(self):
		"""
		Dependency to get a database session for a request.
		It ensures the session is closed after the request is finished.
		"""
		db = SessionLocal()

		try:
			yield db
		finally:
			db.close()


database_service = DatabaseService()
