# Batch size thresholds based on GPU memory (in GB)
# Format: (max_memory_gb, recommended_batch_size)
BATCH_SIZE_THRESHOLDS = [
	(4, 1),  # < 4GB: max 1 image
	(8, 2),  # < 8GB: max 2 images
	(12, 3),  # < 12GB: max 3 images
	(16, 4),  # < 16GB: max 4 images
	(float('inf'), 6),  # >= 16GB: max 6 images
]
