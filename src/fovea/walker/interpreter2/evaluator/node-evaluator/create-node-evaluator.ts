import {Node} from "typescript";
import {ICreateNodeEvaluatorOptions} from "./i-create-node-evaluator-options";
import {NodeEvaluator} from "./node-evaluator";
import {MaxOpsExceededError} from "../../error/max-ops-exceeded-error/max-ops-exceeded-error";
import {LexicalEnvironment, setLexicalEnvironmentForNode} from "../../lexical-environment/lexical-environment";
import {evaluateNode} from "../evaluate-node";
import {Continuation} from "../../continuation/continuation";

/**
 * Creates a Node Evaluator
 * @param {ICreateNodeEvaluatorOptions} options
 * @returns {NodeEvaluator}
 */
export function createNodeEvaluator ({maxOps, context, deterministic}: ICreateNodeEvaluatorOptions): NodeEvaluator {
	let ops = 0;
	let initialEnvironment: LexicalEnvironment|undefined;

	const nodeEvaluator: NodeEvaluator = (newNode: Node, newEnvironment: LexicalEnvironment, newContinuation: Continuation): void => {
		if (initialEnvironment == null) initialEnvironment = newEnvironment;
		const sourceFile = newNode.getSourceFile();

		// Don't attempt to evaluate anything within ambient files
		if (sourceFile != null && sourceFile.isDeclarationFile) {
			return newContinuation(undefined);
		}

		// Increment the amount of encountered ops
		ops++;

		// Throw an error if the maximum amount of operations has been exceeded
		if (ops >= maxOps) {
			throw new MaxOpsExceededError();
		}

		// Set the lexical environment for that Node
		setLexicalEnvironmentForNode(newNode, newEnvironment);

		evaluateNode({
			initialEnvironment,
			environment: newEnvironment,
			node: newNode,
			deterministic,
			context,
			continuation: newContinuation,
			evaluate: nodeEvaluator
		});
	};
	return nodeEvaluator;
}