import {Node} from "typescript";

export type NonDeterministicValue = true|((...args: Node[]) => boolean);
export interface NondeterministicMap {
	[key: string]: NondeterministicMap|NonDeterministicValue;
}

/**
 * A Map between built-in identifiers and the members that produce non-deterministic results.
 * @type {NondeterministicMap}
 */
export const NONDETERMINISTICS: NondeterministicMap = {
	Math: {
		"random()": true
	},
	Date: {
		"now()": true,
		// Dates that receive no arguments are nondeterministic since they care about "now" and will evaluate to a new value for each invocation
		constructor: (...args: Node[]) => args.length === 0
	},
	performance: {
		"now()": true
	},
	"fetch()": true
};