from app.schemas.samplers import SamplerItem

from .schedulers import SCHEDULER_DESCRIPTIONS, SCHEDULER_NAMES, SamplerType


class SamplersService:
	"""
	A service class to manage samplers used across the application.
	"""

	@property
	def samplers(self):
		"""
		Returns a list of all available sampler types.
		"""
		return [
			SamplerItem(
				value=stype.value,
				name=SCHEDULER_NAMES[stype],
				description=SCHEDULER_DESCRIPTIONS[stype],
			)
			for stype in SamplerType
		]


samplers_service = SamplersService()
