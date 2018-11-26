import {IEvaluatorOptions} from "./i-evaluator-options";
import {Node, NodeArray} from "typescript";
import {Literal} from "../literal/literal";

/**
 * Evaluates, or attempts to evaluate, a NodeArray
 * @param {IEvaluatorOptions<NodeArray>} options
 * @returns {Literal}
 */
export function evaluateNodeArray<T extends Node> ({node, continuation, environment}: IEvaluatorOptions<NodeArray<T>>): Literal {
	let value: Literal;
	for (const statement of node) {
		value = continuation.run(statement, environment);
		if (continuation.isTerminated) return value;
	}
	return value;
}