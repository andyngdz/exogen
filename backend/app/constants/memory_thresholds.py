"""Memory threshold constants for optimization decisions.

These thresholds determine when to enable/disable various memory-saving techniques
based on available GPU memory.
"""

# Attention slicing threshold (in GB)
# GPUs with less than this amount of VRAM will use attention slicing (slower but uses less memory)
# GPUs with more will disable attention slicing (faster but uses more memory)
ATTENTION_SLICING_THRESHOLD_GB = 8.0

# Low memory threshold - used for various conservative settings
LOW_MEMORY_THRESHOLD_GB = 4.0

# High memory threshold - used for aggressive performance settings
HIGH_MEMORY_THRESHOLD_GB = 16.0
