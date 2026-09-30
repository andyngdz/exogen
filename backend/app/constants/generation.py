"""Constants for image generation process."""

# GPU cache clearing interval (in steps)
# Clears CUDA/MPS cache every N steps during generation to prevent memory buildup
# Lower values = more frequent clearing (better memory management, slightly slower)
# Higher values = less frequent clearing (faster, but may cause OOM on low VRAM)
CACHE_CLEAR_INTERVAL = 3

# Default negative prompt to avoid common quality issues
# Used when user doesn't specify a custom negative prompt
DEFAULT_NEGATIVE_PROMPT = (
	'(worst quality, low quality, lowres, blurry, jpeg artifacts, watermark, '
	'signature, text, logo), '
	'(bad hands, bad anatomy, mutated, deformed, disfigured, extra limbs, '
	'cropped, out of frame), '
	'(cartoon, anime, cgi, render, 3d, doll, toy, painting, sketch)'
)
