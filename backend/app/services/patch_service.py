"""Service for applying third-party package patches."""

import asyncio
import sys

# Windows-specific event loop policy - only available on Windows
# Using sys.platform here for type narrowing at module level
if sys.platform == 'win32':
	WindowsProactorEventLoopPolicy = asyncio.WindowsProactorEventLoopPolicy
else:
	WindowsProactorEventLoopPolicy = None


def setup_windows_event_loop() -> None:
	"""Set Windows-specific event loop policy for compatibility."""
	if WindowsProactorEventLoopPolicy is None:
		return

	asyncio.set_event_loop_policy(WindowsProactorEventLoopPolicy())
