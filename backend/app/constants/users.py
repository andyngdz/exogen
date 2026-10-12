import re

PLACEHOLDER_IMAGE_PATH = 'static/empty.png'
HUGGINGFACE_API_BASE = 'https://huggingface.co/api'
MAX_USER_ID_LENGTH = 100
VALID_USER_ID_PATTERN = re.compile(r'^[a-zA-Z0-9][a-zA-Z0-9._-]*$')
