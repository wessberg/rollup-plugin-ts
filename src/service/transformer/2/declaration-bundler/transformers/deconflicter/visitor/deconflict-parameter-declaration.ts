import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../../type/ts";

/**
 * Deconflicts the given ParameterDeclaration.
 */
export function deconflictParameterDeclaration({
	node,
	continuation,
	lexicalEnvironment,
	typescript
}: DeconflicterVisitorOptions<TS.ParameterDeclaration>): TS.ParameterDeclaration | undefined {
	const nameContResult = typescript.isIdentifier(node.name) ? node.name : continuation(node.name, {lexicalEnvironment});

	const typeContResult = node.type == null ? undefined : continuation(node.type, {lexicalEnvironment});
	const initializerContResult = node.initializer == null ? undefined : continuation(node.initializer, {lexicalEnvironment});

	const isIdentical = nameContResult === node.name && typeContResult === node.type && initializerContResult === node.initializer;

	if (isIdentical) {
		return node;
	}

	return typescript.updateParameter(
		node,
		node.decorators,
		node.modifiers,
		node.dotDotDotToken,
		nameContResult,
		node.questionToken,
		typeContResult,
		initializerContResult
	);
}
