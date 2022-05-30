import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options.js";
import {TS} from "../../../../../../type/ts.js";
import {cloneLexicalEnvironment} from "../../../util/clone-lexical-environment.js";
import {nodeArraysAreEqual} from "../../../util/node-arrays-are-equal.js";
import {ContinuationOptions} from "../deconflicter-options.js";
import {preserveMeta} from "../../../util/clone-node-with-meta.js";

/**
 * Deconflicts the given ConstructorDeclaration.
 */
export function deconflictConstructorDeclaration(options: DeconflicterVisitorOptions<TS.ConstructorDeclaration>): TS.ConstructorDeclaration | undefined {
	const {node, continuation, lexicalEnvironment, factory} = options;

	// The body and parameters share the same lexical environment
	const nextContinuationOptions: ContinuationOptions = {lexicalEnvironment: cloneLexicalEnvironment(lexicalEnvironment)};

	const parametersContResult = node.parameters?.map(parameter => continuation(parameter, nextContinuationOptions)) ?? [];
	const bodyContResult = node.body == null ? undefined : continuation(node.body, nextContinuationOptions);

	const isIdentical = nodeArraysAreEqual(parametersContResult, node.parameters) && bodyContResult === node.body;

	if (isIdentical) {
		return node;
	}

	return preserveMeta(factory.updateConstructorDeclaration(node, node.decorators, node.modifiers, parametersContResult, bodyContResult), node, options);
}
