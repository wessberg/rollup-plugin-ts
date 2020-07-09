import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";
import {cloneLexicalEnvironment} from "../../../util/clone-lexical-environment";
import {nodeArraysAreEqual} from "../../../util/node-arrays-are-equal";
import {ContinuationOptions} from "../deconflicter-options";
import {preserveMeta} from "../../../util/clone-node-with-meta";
import {isNodeFactory} from "../../../util/is-node-factory";

/**
 * Deconflicts the given GetAccessorDeclaration.
 */
export function deconflictGetAccessorDeclaration(options: DeconflicterVisitorOptions<TS.GetAccessorDeclaration>): TS.GetAccessorDeclaration | undefined {
	const {node, continuation, lexicalEnvironment, compatFactory, typescript} = options;
	const nameContResult = typescript.isIdentifier(node.name) ? node.name : continuation(node.name, {lexicalEnvironment});

	// The body, as well as the parameters share the same lexical environment
	const nextContinuationOptions: ContinuationOptions = {lexicalEnvironment: cloneLexicalEnvironment(lexicalEnvironment)};

	const parametersContResult = node.parameters.map(parameter => continuation(parameter, nextContinuationOptions));
	const typeContResult = node.type == null ? undefined : continuation(node.type, nextContinuationOptions);
	const bodyContResult = node.body == null ? undefined : continuation(node.body, nextContinuationOptions);

	const isIdentical = nameContResult === node.name && nodeArraysAreEqual(parametersContResult, node.parameters) && typeContResult === node.type && bodyContResult === node.body;

	if (isIdentical) {
		return node;
	}

	return preserveMeta(
		isNodeFactory(compatFactory)
			? compatFactory.updateGetAccessorDeclaration(node, node.decorators, node.modifiers, nameContResult, parametersContResult, typeContResult, bodyContResult)
			: compatFactory.updateGetAccessor(node, node.decorators, node.modifiers, nameContResult, parametersContResult, typeContResult, bodyContResult),
		node,
		options
	);
}
