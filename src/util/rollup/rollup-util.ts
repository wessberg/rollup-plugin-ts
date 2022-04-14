import {InputOptions} from "rollup";

interface EqualResult {
	equal: true;
}

interface NotEqualResult {
	equal: false;
	path: string[];
}

type EqualityResult = EqualResult | NotEqualResult;

const ignoredKeys = new Set(["cache"]);

/**
 * Treat the options as equal if their properties are somewhat equal, not taking their cache into account
 */
export function inputOptionsAreEqual(a: InputOptions, b: InputOptions): boolean {
	return inputValuesAreEqual(a, b).equal;
}

function inputValuesAreEqual(a: unknown, b: unknown, path: string[] = []): EqualityResult {
	if (a === b || (a == null && b == null)) return {equal: true};
	else if (typeof a !== typeof b) return {equal: false, path};
	else if (Array.isArray(a)) {
		if (!Array.isArray(b)) return {equal: false, path};
		else if (a.length !== b.length) return {equal: false, path};
		else if (a.some((element, index) => !inputValuesAreEqual(element, b[index], [...path, String(index)]).equal)) {
			return {equal: false, path};
		} else {
			return {equal: true};
		}
	} else if (typeof a === "object" && a != null) {
		if (typeof b !== "object" || b == null) return {equal: false, path};

		const aKeys = Object.keys(a).filter(key => !ignoredKeys.has(key));
		const bKeys = Object.keys(b).filter(key => !ignoredKeys.has(key));

		if (aKeys.length !== bKeys.length) return {equal: false, path};
		else if (aKeys.some(key => !inputValuesAreEqual(a[key as keyof typeof a], b[key as keyof typeof b], [...path, key]).equal)) {
			return {equal: false, path};
		} else {
			return {equal: true};
		}
	} else {
		return {equal: true};
	}
}
