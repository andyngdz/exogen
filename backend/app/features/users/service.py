from app.constants.users import MAX_USER_ID_LENGTH, VALID_USER_ID_PATTERN


class UserService:
	"""Service for user-related operations."""

	def is_valid_user_id(self, user_id: str) -> bool:
		"""Validate user_id to prevent SSRF attacks."""
		if not user_id or len(user_id) > MAX_USER_ID_LENGTH:
			return False
		return VALID_USER_ID_PATTERN.match(user_id) is not None


user_service = UserService()
