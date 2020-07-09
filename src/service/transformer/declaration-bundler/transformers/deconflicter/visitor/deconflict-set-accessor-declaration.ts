import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";
import {cloneLexicalEnvironment} from "../../../util/clone-lexical-environment";
import {nodeArraysAreEqual} from "../../../util/node-arrays-are-equal";
import {ContinuationOptions} from "../deconflicter-options";
import {preserveMeta} from "../../../util/clone-node-with-meta";
import {isNodeFactory} from "../../../util/is-node-factory";

/**
 * Deconflicts the given SetAccessorDeclaration.
 */
export function deconflictSetAccessorDeclaration(options: DeconflicterVisitorOptions<TS.SetAccessorDeclaration>): TS.SetAccessorDeclaration | undefined {
	const {node, continuation, lexicalEnvironment, compatFactory, typescript} = options;
	const nameContResult = typescript.isIdentifier(node.name) ? node.name : continuation(node.name, {lexicalEnvironment});

	// The body, as well as the parameters share the same lexical environment
	const nextContinuationOptions: ContinuationOptions = {lexicalEnvironment: cloneLexicalEnvironment(lexicalEnvironment)};

	const parametersContResult = node.parameters.map(parameter => continuation(parameter, nextContinuationOptions));
	const bodyContResult = node.body == null ? undefined : continuation(node.body, nextContinuationOptions);

	const isIdentical = nameContResult === node.name && nodeArraysAreEqual(parametersContResult, node.parameters) && bodyContResult === node.body;

	if (isIdentical) {
		return node;
	}
	return preserveMeta(
		isNodeFactory(compatFactory)
			? compatFactory.updateSetAccessorDeclaration(node, node.decorators, node.modifiers, nameContResult, parametersContResult, bodyContResult)
			: compatFactory.updateSetAccessor(node, node.decorators, node.modifiers, nameContResult, parametersContResult, bodyContResult),
		node,
		options
	);
}
