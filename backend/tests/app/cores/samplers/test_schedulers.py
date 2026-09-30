"""Tests for scheduler completeness and metadata integrity.

This test suite ensures that all SamplerType enum values have the required metadata:
- Scheduler class mapping (SCHEDULER_MAPPING)
- Display name (SCHEDULER_NAMES)
- Description (SCHEDULER_DESCRIPTIONS)

These tests prevent incomplete scheduler additions and catch metadata errors early.
"""

import pytest

from app.cores.samplers import (
	SCHEDULER_DESCRIPTIONS,
	SCHEDULER_MAPPING,
	SCHEDULER_NAMES,
	SamplerType,
)


class TestSchedulerCompleteness:
	"""Verify all samplers have required metadata and mappings."""

	def test_all_samplers_have_scheduler_mapping(self) -> None:
		"""All SamplerType enum values must have a scheduler class mapping.

		This ensures every sampler can be instantiated via SCHEDULER_MAPPING.
		"""
		missing = []
		for sampler in SamplerType:
			if sampler not in SCHEDULER_MAPPING:
				missing.append(sampler.value)

		assert not missing, f'Samplers missing from SCHEDULER_MAPPING: {missing}'

	def test_all_samplers_have_display_names(self) -> None:
		"""All SamplerType enum values must have display names.

		Display names are shown in the UI/API for user selection.
		"""
		missing = []
		for sampler in SamplerType:
			if sampler not in SCHEDULER_NAMES:
				missing.append(sampler.value)

		assert not missing, f'Samplers missing from SCHEDULER_NAMES: {missing}'

	def test_all_samplers_have_descriptions(self) -> None:
		"""All SamplerType enum values must have descriptions.

		Descriptions help users understand what each sampler does.
		"""
		missing = []
		for sampler in SamplerType:
			if sampler not in SCHEDULER_DESCRIPTIONS:
				missing.append(sampler.value)

		assert not missing, f'Samplers missing from SCHEDULER_DESCRIPTIONS: {missing}'

	def test_scheduler_mapping_returns_valid_classes(self) -> None:
		"""SCHEDULER_MAPPING values must be valid scheduler classes."""
		for sampler, scheduler_class in SCHEDULER_MAPPING.items():
			assert scheduler_class is not None, f'{sampler} maps to None'
			assert callable(scheduler_class), f'{sampler} maps to non-callable: {scheduler_class}'

	def test_scheduler_names_are_non_empty_strings(self) -> None:
		"""SCHEDULER_NAMES values must be non-empty strings."""
		for sampler, name in SCHEDULER_NAMES.items():
			assert isinstance(name, str), f'{sampler} name is not a string: {type(name)}'
			assert len(name) > 0, f'{sampler} has empty name'
			assert name.strip() == name, f'{sampler} name has leading/trailing whitespace: "{name}"'

	def test_scheduler_descriptions_are_non_empty_strings(self) -> None:
		"""SCHEDULER_DESCRIPTIONS values must be non-empty strings."""
		for sampler, description in SCHEDULER_DESCRIPTIONS.items():
			assert isinstance(description, str), f'{sampler} description is not a string: {type(description)}'
			assert len(description) > 0, f'{sampler} has empty description'

	def test_total_scheduler_count(self) -> None:
		"""Verify we have exactly 18 schedulers (15 original + 3 new)."""
		assert len(SamplerType) == 18, f'Expected 18 schedulers, got {len(SamplerType)}'

	def test_new_schedulers_exist(self) -> None:
		"""Verify the 3 new schedulers (HEUN, LCM, TCD) were added."""
		new_schedulers = ['HEUN', 'LCM', 'TCD']

		for scheduler_name in new_schedulers:
			assert hasattr(SamplerType, scheduler_name), f'Missing new scheduler: {scheduler_name}'

	@pytest.mark.parametrize(
		'sampler_name',
		['HEUN', 'LCM', 'TCD'],
	)
	def test_new_schedulers_have_complete_metadata(self, sampler_name: str) -> None:
		"""Verify new schedulers have all required metadata."""
		sampler = SamplerType[sampler_name]

		assert sampler in SCHEDULER_MAPPING, f'{sampler_name} missing scheduler mapping'
		assert sampler in SCHEDULER_NAMES, f'{sampler_name} missing display name'
		assert sampler in SCHEDULER_DESCRIPTIONS, f'{sampler_name} missing description'

		# Verify metadata quality
		assert len(SCHEDULER_NAMES[sampler]) > 0, f'{sampler_name} has empty name'
		assert len(SCHEDULER_DESCRIPTIONS[sampler]) > 0, f'{sampler_name} has empty description'
		assert SCHEDULER_MAPPING[sampler] is not None, f'{sampler_name} has None mapping'


class TestSchedulerMetadataQuality:
	"""Verify scheduler metadata meets quality standards."""

	def test_no_duplicate_display_names(self) -> None:
		"""Each scheduler should have a unique display name."""
		names = list(SCHEDULER_NAMES.values())
		duplicates = [name for name in names if names.count(name) > 1]

		assert not duplicates, f'Duplicate scheduler names found: {set(duplicates)}'

	def test_descriptions_are_informative(self) -> None:
		"""Descriptions should be reasonably informative (at least 20 characters)."""
		short_descriptions = []
		for sampler, description in SCHEDULER_DESCRIPTIONS.items():
			if len(description) < 20:
				short_descriptions.append((sampler.value, description))

		assert not short_descriptions, f'Suspiciously short descriptions: {short_descriptions}'

	def test_enum_values_match_names(self) -> None:
		"""SamplerType enum values should match their attribute names.

		Exception: UNIPC uses 'UniPC' for proper casing in UI.
		"""
		exceptions = {'UNIPC': 'UniPC'}  # Known intentional casing differences

		for sampler in SamplerType:
			expected_value = exceptions.get(sampler.name, sampler.name)
			assert sampler.value == expected_value, f'Enum value mismatch: {sampler.name} != {sampler.value}'
