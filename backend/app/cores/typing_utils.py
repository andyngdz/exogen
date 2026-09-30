from typing import Callable, TypeVar

T = TypeVar('T')


def make_default_list_factory(_: type[T]) -> Callable[[], list[T]]:
	def factory() -> list[T]:
		return []

	return factory
