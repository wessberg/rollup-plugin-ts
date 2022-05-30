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
