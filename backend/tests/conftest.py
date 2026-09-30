"""
Global pytest configuration for the Exogen backend tests.

This file is automatically loaded by pytest before any tests are run.
"""

import pathlib
import sys


# Add project root to Python path for all tests
# This is a cleaner approach than modifying sys.path in individual test files
def pytest_configure(config):
	"""
	Pytest hook that runs before tests are collected.

	This ensures the project root is in sys.path so that tests can import
	from the app package directly without relative imports.
	"""
	project_root = pathlib.Path(__file__).resolve().parent.parent
	if str(project_root) not in sys.path:
		sys.path.insert(0, str(project_root))
