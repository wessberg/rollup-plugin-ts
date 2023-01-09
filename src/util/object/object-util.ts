import {IgnoredLookupValue} from "helpertypes";

// eslint-disable-next-line @typescript-eslint/ban-types
export function isRecord<T>(value: T): value is Exclude<T, IgnoredLookupValue | unknown[]> & {} {
	return (
		!Array.isArray(value) &&
		typeof value === "object" &&
		value != null &&
		!(value instanceof Date) &&
		!(value instanceof Set) &&
		!(value instanceof WeakSet) &&
		!(value instanceof Map) &&
		!(value instanceof WeakMap)
	);
}

export function isPromise <T>(value: unknown|Promise<T>): value is Promise<T> {
	return typeof value === "object" && value != null && "then" in value;
}

export function isArray<T> (value: unknown|readonly T[]): value is readonly T[];
export function isArray<T> (value: unknown|T[]): value is T[];
export function isArray<T> (value: unknown|T[]|readonly T[]): value is T[]|readonly T[];
export function isArray<T> (value: unknown|T[]|readonly T[]): value is T[]|readonly T[] {
	return Array.isArray(value);
}