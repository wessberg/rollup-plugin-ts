export function assertDefined<T>(item: T | undefined | null, message: string): asserts item is T {
	if (item == null) {
		throw new ReferenceError(message);
	}
}

export function ensureDefined<T>(item: T | undefined | null, message: string): T {
	assertDefined(item, message);
	return item;
}
