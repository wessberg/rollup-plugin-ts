export function isDefined<T>(item: T | undefined | null): item is T {
	return item != null;
}
