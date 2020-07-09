import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";
import {cloneLexicalEnvironment} from "../../../util/clone-lexical-environment";
import {nodeArraysAreEqual} from "../../../util/node-arrays-are-equal";
import {ContinuationOptions} from "../deconflicter-options";
import {preserveMeta} from "../../../util/clone-node-with-meta";
import {isNodeFactory} from "../../../util/is-node-factory";

/**
 * Deconflicts the given ConstructorDeclaration.
 */
export function deconflictConstructorDeclaration(options: DeconflicterVisitorOptions<TS.ConstructorDeclaration>): TS.ConstructorDeclaration | undefined {
	const {node, continuation, lexicalEnvironment, compatFactory} = options;

	// The body and parameters share the same lexical environment
	const nextContinuationOptions: ContinuationOptions = {lexicalEnvironment: cloneLexicalEnvironment(lexicalEnvironment)};

	const parametersContResult = node.parameters.map(parameter => continuation(parameter, nextContinuationOptions));
	const bodyContResult = node.body == null ? undefined : continuation(node.body, nextContinuationOptions);

	const isIdentical = nodeArraysAreEqual(parametersContResult, node.parameters) && bodyContResult === node.body;

	if (isIdentical) {
		return node;
	}

	return preserveMeta(
		isNodeFactory(compatFactory)
			? compatFactory.updateConstructorDeclaration(node, node.decorators, node.modifiers, parametersContResult, bodyContResult)
			: compatFactory.updateConstructor(node, node.decorators, node.modifiers, parametersContResult, bodyContResult),
		node,
		options
	);
}
