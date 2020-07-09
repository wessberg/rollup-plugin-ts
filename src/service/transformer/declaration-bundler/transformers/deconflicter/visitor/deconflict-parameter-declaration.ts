import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";
import {preserveMeta} from "../../../util/clone-node-with-meta";
import {isNodeFactory} from "../../../util/is-node-factory";

/**
 * Deconflicts the given ParameterDeclaration.
 */
export function deconflictParameterDeclaration(options: DeconflicterVisitorOptions<TS.ParameterDeclaration>): TS.ParameterDeclaration | undefined {
	const {node, continuation, lexicalEnvironment, compatFactory, typescript} = options;
	const nameContResult = typescript.isIdentifier(node.name) ? node.name : continuation(node.name, {lexicalEnvironment});

	const typeContResult = node.type == null ? undefined : continuation(node.type, {lexicalEnvironment});
	const initializerContResult = node.initializer == null ? undefined : continuation(node.initializer, {lexicalEnvironment});

	const isIdentical = nameContResult === node.name && typeContResult === node.type && initializerContResult === node.initializer;

	if (isIdentical) {
		return node;
	}

	return preserveMeta(
		isNodeFactory(compatFactory)
			? compatFactory.updateParameterDeclaration(
					node,
					node.decorators,
					node.modifiers,
					node.dotDotDotToken,
					nameContResult,
					node.questionToken,
					typeContResult,
					initializerContResult
			  )
			: compatFactory.updateParameter(node, node.decorators, node.modifiers, node.dotDotDotToken, nameContResult, node.questionToken, typeContResult, initializerContResult),
		node,
		options
	);
}
