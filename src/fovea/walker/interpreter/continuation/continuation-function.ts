import {Node, NodeArray} from "typescript";
import {LexicalEnvironment, setLexicalEnvironmentForNode} from "../lexical-environment/lexical-environment";
import {Literal} from "../literal/literal";
import {EvaluateFailureKind} from "../evaluate-failure";
import {evaluateNode} from "../evaluator/evaluate-node";
import {SourceFileContext} from "../../shared/i-source-file-context";
import {isNodeArray} from "../../util/node-array/is-node-array";

export type ContinuationFunction = ((node: Node|NodeArray<Node>, environment: LexicalEnvironment) => Literal);

export interface IContinuationFactoryOptions {
	context: SourceFileContext;
	initialEnvironment: LexicalEnvironment;
	deterministic: boolean;
	maxOps: number;
}

export interface IContinuation {
	run: ContinuationFunction;
	isTerminated: boolean;
}

export interface IContinuationFactory {
	create (hook?: ContinuationNodeHook): IContinuation;
}

export type ContinuationNodeHook = (node: Node|NodeArray<Node>) => boolean;

/**
 * Creates a ContinuationFactory
 * @param {SourceFileContext} context
 * @param {number} maxOps
 * @param {boolean} deterministic
 * @param {LexicalEnvironment} initialEnvironment
 * @returns {IContinuationFactory}
 */
export function createContinuationFactory ({context, maxOps, deterministic, initialEnvironment}: IContinuationFactoryOptions): IContinuationFactory {
	let ops = 0;

	const continuationFactory = {
		create: (hook?: ContinuationNodeHook): IContinuation => {
			let lastValue: Literal;

			const continuation: IContinuation = {
				run,
				isTerminated: false
			};

			function run (newNode: Node|NodeArray<Node>, newEnvironment: LexicalEnvironment): Literal {
				if (isNodeArray(newNode) && newNode[0] == null) return lastValue;

				if (continuation.isTerminated) return lastValue;

				const sourceFile = isNodeArray(newNode) ? newNode[0].getSourceFile() : newNode.getSourceFile();

				// Don't attempt to evaluate anything within ambient files
				if (sourceFile != null && sourceFile.isDeclarationFile) {
					return undefined;
				}

				// Increment the amount of computed operations
				ops++;

				// Throw an error if the maximum amount of operations has been exceeded
				if (ops >= maxOps) {
					throw new SyntaxError(EvaluateFailureKind.MAX_OPS_EXCEEDED);
				}

				setLexicalEnvironmentForNode(newNode, newEnvironment);

				lastValue = evaluateNode({
					context,
					node: newNode,
					initialEnvironment,
					environment: newEnvironment,
					deterministic,
					continuation,
					continuationFactory
				});

				if (hook != null && !continuation.isTerminated) {
					continuation.isTerminated = hook(newNode);
				}

				return lastValue;
			}

			return continuation;
		}
	};
	return continuationFactory;
}