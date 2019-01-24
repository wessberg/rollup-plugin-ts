/**
 * Ensures that the given item is in fact an array
 * @param {T[] | T} item
 * @returns {T[]}
 */
export function ensureArray<T>(item: T | T[]): T[] {
	return Array.isArray(item) ? item : [item];
}
