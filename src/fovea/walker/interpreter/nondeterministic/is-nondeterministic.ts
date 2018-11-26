import {Node} from "typescript";
import {has, get} from "object-path";
import {NondeterministicMap, NONDETERMINISTICS, NonDeterministicValue} from "./nondeterministics";

/**
 * Returns true if the given path represents something that is nondeterministic.
 * Receives an array of arguments since they may decide whether or not the thing is nondeterministic
 * @param {string} path
 * @param {Node[]} args
 * @returns {boolean}
 */
export function isNonDeterministic (path: string, args: ReadonlyArray<Node> = []): boolean {
	const fullPathSplitted = path.split(".");

	// Attempt for each nested path going up until you arrive at the base. So for example, if "fetch.name" isn't matched, try with "fetch" and see if that one is
	while (fullPathSplitted.length > 0) {
		const joinedPath = fullPathSplitted.join(".");
		if (!has(NONDETERMINISTICS, joinedPath)) return false;
		const match = get<NondeterministicMap, NondeterministicMap|NonDeterministicValue>(NONDETERMINISTICS, joinedPath);
		if (match === true || (typeof match === "function" && match(...args))) return true;
		fullPathSplitted.splice(fullPathSplitted.length - 1, 1);
	}
	return false;
}