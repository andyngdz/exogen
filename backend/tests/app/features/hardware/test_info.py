"""Unit tests for GPUInfo class messages."""

from app.features.hardware.info import GPUInfo


class TestNvidiaMessages:
	"""Test NVIDIA-related message methods."""

	def test_nvidia_ready(self):
		"""Test NVIDIA ready message."""
		message = GPUInfo.nvidia_ready()
		assert isinstance(message, str)
		assert 'NVIDIA GPU' in message
		assert 'ready' in message

	def test_nvidia_no_gpu(self):
		"""Test NVIDIA no GPU message."""
		message = GPUInfo.nvidia_no_gpu()
		assert isinstance(message, str)
		assert 'No NVIDIA GPU' in message or 'CUDA is not available' in message
		assert 'CPU' in message

	def test_nvidia_driver_issue(self):
		"""Test NVIDIA driver issue message."""
		message = GPUInfo.nvidia_driver_issue()
		assert isinstance(message, str)
		assert 'NVIDIA GPU detected' in message
		assert 'CUDA is not available' in message or 'drivers are incompatible' in message

	def test_nvidia_smi_warning(self):
		"""Test nvidia-smi warning message."""
		message = GPUInfo.nvidia_smi_warning()
		assert isinstance(message, str)
		assert 'nvidia-smi' in message
		assert 'PATH' in message

	def test_nvidia_recommendation_link(self):
		"""Test NVIDIA recommendation link."""
		link = GPUInfo.nvidia_recommendation_link()
		assert isinstance(link, str)
		assert link.startswith('https://')
		assert 'nvidia.com' in link

	def test_nvidia_troubleshooting_steps(self):
		"""Test NVIDIA troubleshooting steps."""
		steps = GPUInfo.nvidia_troubleshooting_steps()
		assert isinstance(steps, list)
		assert len(steps) > 0
		assert all(isinstance(step, str) for step in steps)
		# Verify key content
		assert any('NVIDIA GPU' in step for step in steps)
		assert any('drivers' in step for step in steps)
		assert any('PyTorch' in step for step in steps)

	def test_nvidia_driver_status_step(self):
		"""Test NVIDIA driver status check step."""
		step = GPUInfo.nvidia_driver_status_step()
		assert isinstance(step, str)
		assert 'NVIDIA' in step or 'driver' in step


class TestMacOSMessages:
	"""Test macOS-related message methods."""

	def test_macos_mps_ready(self):
		"""Test macOS MPS ready message with performance warning."""
		message = GPUInfo.macos_mps_ready()
		assert isinstance(message, str)
		assert 'Apple Silicon' in message
		assert 'slower' in message or 'performance' in message.lower()
		assert 'NVIDIA' in message  # Should mention comparison to NVIDIA

	def test_macos_no_acceleration(self):
		"""Test macOS no GPU acceleration message."""
		message = GPUInfo.macos_no_acceleration()
		assert isinstance(message, str)
		assert 'No GPU acceleration' in message
		assert 'CPU' in message

	def test_macos_troubleshooting_steps(self):
		"""Test macOS troubleshooting steps."""
		steps = GPUInfo.macos_troubleshooting_steps()
		assert isinstance(steps, list)
		assert len(steps) > 0
		assert all(isinstance(step, str) for step in steps)
		# Verify macOS-specific content
		assert any('Apple Silicon' in step or 'M1' in step or 'M2' in step for step in steps)
		assert any('macOS' in step for step in steps)


class TestGeneralMessages:
	"""Test general and error message methods."""

	def test_default_detecting(self):
		"""Test default GPU detection message."""
		message = GPUInfo.default_detecting()
		assert isinstance(message, str)
		assert 'detect' in message.lower()
		assert 'GPU' in message

	def test_unsupported_os(self):
		"""Test unsupported OS message with OS name interpolation."""
		os_name = 'FreeBSD'
		message = GPUInfo.unsupported_os(os_name)
		assert isinstance(message, str)
		assert os_name in message
		assert 'Unsupported' in message
		assert 'CPU' in message

	def test_pytorch_not_installed(self):
		"""Test PyTorch not installed message."""
		message = GPUInfo.pytorch_not_installed()
		assert isinstance(message, str)
		assert 'PyTorch' in message
		assert 'not installed' in message or 'not accessible' in message

	def test_pytorch_troubleshooting(self):
		"""Test PyTorch troubleshooting steps."""
		steps = GPUInfo.pytorch_troubleshooting()
		assert isinstance(steps, list)
		assert len(steps) > 0
		assert all(isinstance(step, str) for step in steps)
		assert any('PyTorch' in step for step in steps)

	def test_unexpected_error(self):
		"""Test unexpected error message with error interpolation."""
		error_msg = 'Test error occurred'
		message = GPUInfo.unexpected_error(error_msg)
		assert isinstance(message, str)
		assert error_msg in message
		assert 'error' in message.lower()
		assert 'CPU' in message

	def test_error_troubleshooting_steps(self):
		"""Test general error troubleshooting steps."""
		steps = GPUInfo.error_troubleshooting_steps()
		assert isinstance(steps, list)
		assert len(steps) > 0
		assert all(isinstance(step, str) for step in steps)
		assert any('logs' in step or 'dependencies' in step for step in steps)


class TestAPIResponseMessages:
	"""Test API response message methods."""

	def test_device_set_success(self):
		"""Test device set success message."""
		message = GPUInfo.device_set_success()
		assert isinstance(message, str)
		assert 'Device' in message or 'device' in message
		assert 'success' in message.lower()

	def test_memory_config_success(self):
		"""Test memory configuration success message."""
		message = GPUInfo.memory_config_success()
		assert isinstance(message, str)
		assert 'memory' in message.lower()
		assert 'success' in message.lower()
