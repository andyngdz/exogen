import fnmatch
from pathlib import PurePosixPath
from typing import List, Set

import pydash

VARIANTS = ['fp16', 'non_ema', 'ema_only']


def get_directory_from_path(file_path: str) -> str:
	"""Extract directory path from a file path.

	Examples:
		>>> get_directory_from_path('unet/model.safetensors')
		'unet'
		>>> get_directory_from_path('model.safetensors')
		''
		>>> get_directory_from_path('a/b/c/model.bin')
		'a/b/c'
	"""
	parent = str(PurePosixPath(file_path).parent)
	return parent if parent != '.' else ''


def get_filename_from_path(file_path: str) -> str:
	"""Extract filename from a file path.

	Examples:
		>>> get_filename_from_path('unet/model.safetensors')
		'model.safetensors'
		>>> get_filename_from_path('model.safetensors')
		'model.safetensors'
		>>> get_filename_from_path('a/b/c/model.bin')
		'model.bin'
	"""
	return PurePosixPath(file_path).name


def _is_variant_filename(filename: str) -> bool:
	return pydash.some(VARIANTS, lambda variant: variant in filename)


def _filter_files_in_scope(files: List[str], scopes: List[str]) -> List[str]:
	return list(
		pydash.filter_(
			files,
			lambda file_path: pydash.some(scopes, lambda scope: fnmatch.fnmatch(file_path, scope)),
		)
	)


def _get_dirs_with_standard_safetensors(files: List[str]) -> Set[str]:
	dirs = set()

	for file_path in files:
		if not file_path.endswith('.safetensors'):
			continue

		filename = get_filename_from_path(file_path)
		if not _is_variant_filename(filename):
			directory = get_directory_from_path(file_path)
			if directory:
				dirs.add(directory)

	return dirs


def _should_ignore_file(file_path: str, dirs_with_standard: Set[str]) -> bool:
	directory = get_directory_from_path(file_path)
	if directory not in dirs_with_standard:
		return False

	if file_path.endswith('.bin'):
		return True

	filename = get_filename_from_path(file_path)

	return _is_variant_filename(filename)


def get_ignore_components(files: List[str], scopes: List[str]) -> List[str]:
	"""
	Return files that should be ignored to avoid downloading bloat.

	Strategy:
	1. Identify directories with STANDARD .safetensors files (not fp16/non_ema/ema_only)
	2. Filter duplicate .bin files (when standard .safetensors exists in same directory)
	3. Filter variants (fp16, non_ema, ema_only) ONLY if standard exists in same directory

	This reduces download size from ~10-15 GB to ~4.3 GB for typical models while
	preserving fp16-only models like RunDiffusion/Juggernaut-XL-v9.

	Example with standard files:
		- "unet/diffusion_pytorch_model.safetensors" → kept (standard)
		- "unet/diffusion_pytorch_model.bin" → ignored (duplicate of .safetensors)
		- "unet/diffusion_pytorch_model.fp16.safetensors" → ignored (variant with standard)

	Example with fp16-only files:
		- "unet/diffusion_pytorch_model.fp16.safetensors" → kept (only available file)
	"""
	in_scope = _filter_files_in_scope(files, scopes)
	dirs_with_standard = _get_dirs_with_standard_safetensors(in_scope)

	return list(pydash.filter_(in_scope, lambda f: _should_ignore_file(f, dirs_with_standard)))
