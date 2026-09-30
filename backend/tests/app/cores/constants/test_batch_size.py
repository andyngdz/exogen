import pytest

from app.constants.batch_size import BATCH_SIZE_THRESHOLDS


class TestBatchSizeThresholdsStructure:
	def test_constant_exists_and_is_list(self):
		assert isinstance(BATCH_SIZE_THRESHOLDS, list)
		assert len(BATCH_SIZE_THRESHOLDS) > 0

	def test_has_expected_number_of_thresholds(self):
		assert len(BATCH_SIZE_THRESHOLDS) == 5

	def test_each_threshold_is_tuple_with_two_elements(self):
		for threshold in BATCH_SIZE_THRESHOLDS:
			assert isinstance(threshold, tuple)
			assert len(threshold) == 2

	def test_memory_thresholds_are_numeric(self):
		for memory_threshold, _ in BATCH_SIZE_THRESHOLDS:
			assert isinstance(memory_threshold, (int, float))
			assert memory_threshold > 0 or memory_threshold == float('inf')

	def test_batch_sizes_are_positive_integers(self):
		for _, batch_size in BATCH_SIZE_THRESHOLDS:
			assert isinstance(batch_size, int)
			assert batch_size > 0


class TestBatchSizeThresholdsOrder:
	def test_thresholds_in_ascending_order(self):
		memory_thresholds = [threshold for threshold, _ in BATCH_SIZE_THRESHOLDS]

		# Check ascending order (excluding infinity)
		for i in range(len(memory_thresholds) - 1):
			if memory_thresholds[i] != float('inf') and memory_thresholds[i + 1] != float('inf'):
				assert memory_thresholds[i] < memory_thresholds[i + 1]

	def test_batch_sizes_increase_with_memory(self):
		batch_sizes = [batch_size for _, batch_size in BATCH_SIZE_THRESHOLDS]

		# Batch sizes should generally increase as memory increases
		for i in range(len(batch_sizes) - 1):
			assert batch_sizes[i] <= batch_sizes[i + 1]

	def test_final_threshold_is_infinity(self):
		last_memory_threshold, _ = BATCH_SIZE_THRESHOLDS[-1]
		assert last_memory_threshold == float('inf')


class TestBatchSizeThresholdsValues:
	def test_first_threshold_is_4gb_1_image(self):
		memory_threshold, batch_size = BATCH_SIZE_THRESHOLDS[0]
		assert memory_threshold == 4
		assert batch_size == 1

	def test_second_threshold_is_8gb_2_images(self):
		memory_threshold, batch_size = BATCH_SIZE_THRESHOLDS[1]
		assert memory_threshold == 8
		assert batch_size == 2

	def test_third_threshold_is_12gb_3_images(self):
		memory_threshold, batch_size = BATCH_SIZE_THRESHOLDS[2]
		assert memory_threshold == 12
		assert batch_size == 3

	def test_fourth_threshold_is_16gb_4_images(self):
		memory_threshold, batch_size = BATCH_SIZE_THRESHOLDS[3]
		assert memory_threshold == 16
		assert batch_size == 4

	def test_fifth_threshold_is_infinity_6_images(self):
		memory_threshold, batch_size = BATCH_SIZE_THRESHOLDS[4]
		assert memory_threshold == float('inf')
		assert batch_size == 6


class TestBatchSizeThresholdsUsage:
	@pytest.mark.parametrize(
		'memory_gb,expected_batch_size',
		[
			(2, 1),  # < 4GB -> 1 image
			(3.5, 1),  # < 4GB -> 1 image
			(4, 2),  # Exactly 4GB (not < 4, so checks < 8) -> 2 images
			(5, 2),  # 4GB < memory < 8GB -> 2 images
			(7.9, 2),  # < 8GB -> 2 images
			(8, 3),  # Exactly 8GB (not < 8, so checks < 12) -> 3 images
			(10, 3),  # 8GB < memory < 12GB -> 3 images
			(11.63, 3),  # User's GPU size -> 3 images
			(12, 4),  # Exactly 12GB (not < 12, so checks < 16) -> 4 images
			(14, 4),  # 12GB < memory < 16GB -> 4 images
			(16, 6),  # Exactly 16GB (not < 16, so checks < inf) -> 6 images
			(20, 6),  # > 16GB -> 6 images
			(24, 6),  # > 16GB -> 6 images
			(32, 6),  # > 16GB -> 6 images
		],
	)
	def test_finds_correct_batch_size_for_memory(self, memory_gb, expected_batch_size):
		# Simulate the logic in device_service.get_recommended_batch_size()
		for memory_threshold, batch_size in BATCH_SIZE_THRESHOLDS:
			if memory_gb < memory_threshold:
				assert batch_size == expected_batch_size
				break
