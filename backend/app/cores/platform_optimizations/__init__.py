"""
Platform-specific optimizations for image generation pipelines.

This module provides optimized configurations for different platforms:
- Windows: CUDA optimizations with TF32 and conditional attention slicing
- Linux: Proven working configuration (conservative approach)
- macOS: MPS (Apple Silicon) optimizations

Usage:
    from app.cores.platform_optimizations import get_optimizer

    optimizer = get_optimizer()
    optimizer.apply(pipeline)
"""

from .base import PlatformOptimizer
from .factory import get_optimizer

__all__ = ['PlatformOptimizer', 'get_optimizer']
