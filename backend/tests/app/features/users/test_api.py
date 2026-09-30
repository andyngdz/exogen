"""Tests for users API."""

from unittest.mock import MagicMock, patch

from app.constants.users import HUGGINGFACE_API_BASE, PLACEHOLDER_IMAGE_PATH


class TestUsersAPI:
	"""Test users API endpoints."""

	@patch('app.features.users.api.requests')
	@patch('app.features.users.api.user_service')
	def test_get_user_avatar_with_valid_user_id(self, mock_user_service, mock_requests):
		"""Test get_user_avatar() with valid user ID."""
		from app.features.users.api import get_user_avatar

		mock_user_service.is_valid_user_id.return_value = True

		mock_response = MagicMock()
		mock_response.status_code = 200
		mock_response.json.return_value = {'avatarUrl': 'https://example.com/avatar.png'}

		mock_avatar_response = MagicMock()
		mock_avatar_response.content = b'image_data'
		mock_requests.get.side_effect = [mock_response, mock_avatar_response]

		result = get_user_avatar('john123')

		assert result.media_type == 'image/png'
		assert result.body == b'image_data'
		mock_user_service.is_valid_user_id.assert_called_once_with('john123')

	@patch('app.features.users.api.requests')
	@patch('app.features.users.api.user_service')
	def test_get_user_avatar_falls_back_to_organization(self, mock_user_service, mock_requests):
		"""Test get_user_avatar() falls back to organization on 404."""
		from app.features.users.api import get_user_avatar

		mock_user_service.is_valid_user_id.return_value = True

		mock_user_response = MagicMock()
		mock_user_response.status_code = 404

		mock_org_response = MagicMock()
		mock_org_response.status_code = 200
		mock_org_response.json.return_value = {'avatarUrl': 'https://example.com/org.png'}

		mock_avatar_response = MagicMock()
		mock_avatar_response.content = b'org_image'
		mock_requests.get.side_effect = [mock_user_response, mock_org_response, mock_avatar_response]

		result = get_user_avatar('myorg')

		assert result.media_type == 'image/png'
		assert result.body == b'org_image'
		assert mock_requests.get.call_count == 3

	@patch('app.features.users.api.user_service')
	def test_get_user_avatar_with_invalid_user_id(self, mock_user_service):
		"""Test get_user_avatar() with invalid user ID returns placeholder."""
		from fastapi.responses import FileResponse

		from app.features.users.api import get_user_avatar

		mock_user_service.is_valid_user_id.return_value = False

		result = get_user_avatar('../etc/passwd')

		assert isinstance(result, FileResponse)
		assert result.path == PLACEHOLDER_IMAGE_PATH
		mock_user_service.is_valid_user_id.assert_called_once_with('../etc/passwd')

	@patch('app.features.users.api.requests')
	@patch('app.features.users.api.user_service')
	def test_get_user_avatar_with_svg_avatar(self, mock_user_service, mock_requests):
		"""Test get_user_avatar() with SVG avatar returns placeholder."""
		from fastapi.responses import FileResponse

		from app.features.users.api import get_user_avatar

		mock_user_service.is_valid_user_id.return_value = True

		mock_response = MagicMock()
		mock_response.status_code = 200
		mock_response.json.return_value = {'avatarUrl': 'https://example.com/avatar.svg'}
		mock_requests.get.return_value = mock_response

		result = get_user_avatar('user123')

		assert isinstance(result, FileResponse)
		assert result.path == PLACEHOLDER_IMAGE_PATH

	@patch('app.features.users.api.requests')
	@patch('app.features.users.api.user_service')
	def test_get_user_avatar_with_no_avatar_url(self, mock_user_service, mock_requests):
		"""Test get_user_avatar() with no avatarUrl returns placeholder."""
		from fastapi.responses import FileResponse

		from app.features.users.api import get_user_avatar

		mock_user_service.is_valid_user_id.return_value = True

		mock_response = MagicMock()
		mock_response.status_code = 200
		mock_response.json.return_value = {}
		mock_requests.get.return_value = mock_response

		result = get_user_avatar('user123')

		assert isinstance(result, FileResponse)
		assert result.path == PLACEHOLDER_IMAGE_PATH

	@patch('app.features.users.api.requests')
	@patch('app.features.users.api.user_service')
	def test_get_user_avatar_with_request_exception(self, mock_user_service, mock_requests):
		"""Test get_user_avatar() with request exception returns placeholder."""
		from fastapi.responses import FileResponse

		from app.features.users.api import get_user_avatar

		mock_user_service.is_valid_user_id.return_value = True
		mock_requests.get.side_effect = mock_requests.RequestException('Network error')

		result = get_user_avatar('user123')

		assert isinstance(result, FileResponse)
		assert result.path == PLACEHOLDER_IMAGE_PATH

	@patch('app.features.users.api.requests')
	@patch('app.features.users.api.user_service')
	@patch('app.features.users.api.quote')
	def test_get_user_avatar_quotes_user_id(self, mock_quote, mock_user_service, mock_requests):
		"""Test get_user_avatar() URL-encodes user ID."""
		from app.features.users.api import get_user_avatar

		mock_user_service.is_valid_user_id.return_value = True
		mock_quote.return_value = 'safe_user_id'

		mock_response = MagicMock()
		mock_response.status_code = 200
		mock_response.json.return_value = {'avatarUrl': 'https://example.com/avatar.png'}

		mock_avatar_response = MagicMock()
		mock_avatar_response.content = b'image'
		mock_requests.get.side_effect = [mock_response, mock_avatar_response]

		get_user_avatar('user.name')

		mock_quote.assert_called_once_with('user.name', safe='')
		expected_url = f'{HUGGINGFACE_API_BASE}/users/safe_user_id/avatar'
		mock_requests.get.assert_any_call(expected_url, timeout=5)
