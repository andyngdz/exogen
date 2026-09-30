"""Tests for user service."""

from app.features.users.service import UserService, user_service


class TestUserService:
	"""Test user validation service."""

	def setup_method(self):
		"""Set up test fixtures."""
		self.service = UserService()

	def test_is_valid_user_id_with_valid_alphanumeric(self):
		"""Test is_valid_user_id() with valid alphanumeric input."""
		assert self.service.is_valid_user_id('john123') is True

	def test_is_valid_user_id_with_valid_underscore(self):
		"""Test is_valid_user_id() with valid underscore."""
		assert self.service.is_valid_user_id('john_doe') is True

	def test_is_valid_user_id_with_valid_hyphen(self):
		"""Test is_valid_user_id() with valid hyphen."""
		assert self.service.is_valid_user_id('john-doe') is True

	def test_is_valid_user_id_with_valid_dot(self):
		"""Test is_valid_user_id() with valid dot."""
		assert self.service.is_valid_user_id('john.doe') is True

	def test_is_valid_user_id_with_mixed_valid_chars(self):
		"""Test is_valid_user_id() with mixed valid characters."""
		assert self.service.is_valid_user_id('user_123-test.example') is True

	def test_is_valid_user_id_with_empty_string(self):
		"""Test is_valid_user_id() with empty string."""
		assert self.service.is_valid_user_id('') is False

	def test_is_valid_user_id_with_too_long(self):
		"""Test is_valid_user_id() with string > 100 characters."""
		assert self.service.is_valid_user_id('a' * 101) is False

	def test_is_valid_user_id_with_exactly_100_chars(self):
		"""Test is_valid_user_id() with exactly 100 characters."""
		assert self.service.is_valid_user_id('a' * 100) is True

	def test_is_valid_user_id_with_special_chars(self):
		"""Test is_valid_user_id() with path traversal attempt."""
		assert self.service.is_valid_user_id('../etc/passwd') is False

	def test_is_valid_user_id_starting_with_dot(self):
		"""Test is_valid_user_id() starting with dot."""
		assert self.service.is_valid_user_id('.hidden') is False

	def test_is_valid_user_id_starting_with_hyphen(self):
		"""Test is_valid_user_id() starting with hyphen."""
		assert self.service.is_valid_user_id('-invalid') is False

	def test_is_valid_user_id_starting_with_underscore(self):
		"""Test is_valid_user_id() starting with underscore."""
		assert self.service.is_valid_user_id('_valid') is False

	def test_is_valid_user_id_with_slash(self):
		"""Test is_valid_user_id() with slash."""
		assert self.service.is_valid_user_id('path/traversal') is False

	def test_is_valid_user_id_with_spaces(self):
		"""Test is_valid_user_id() with spaces."""
		assert self.service.is_valid_user_id('john doe') is False

	def test_is_valid_user_id_with_special_symbols(self):
		"""Test is_valid_user_id() with special symbols."""
		assert self.service.is_valid_user_id('user@email.com') is False
		assert self.service.is_valid_user_id('user#123') is False
		assert self.service.is_valid_user_id('user$money') is False

	def test_user_service_singleton_exists(self):
		"""Test user_service singleton instance exists."""
		assert user_service is not None
		assert isinstance(user_service, UserService)
