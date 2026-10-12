from fastapi import status
from fastapi.responses import JSONResponse


class JSONResponseMessage(JSONResponse):
	"""
	Custom JSONResponse to return a message in the response body.
	"""

	def __init__(self, message: str, status_code: int = status.HTTP_200_OK):
		content = {'message': message}
		super().__init__(content=content, status_code=status_code)
