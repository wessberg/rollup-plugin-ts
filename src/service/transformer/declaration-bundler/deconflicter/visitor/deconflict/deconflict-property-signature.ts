import {DeconflicterVisitorOptions} from "../../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";

/**
 * Deconflicts the given PropertySignature.
 */
export function deconflictPropertySignature({
	node,
	continuation,
	lexicalEnvironment,
	typescript
}: DeconflicterVisitorOptions<TS.PropertySignature>): TS.PropertySignature | undefined {
	const nameContResult = typescript.isIdentifier(node.name) ? node.name : continuation(node.name, {lexicalEnvironment});

	const typeContResult = node.type == null ? undefined : continuation(node.type, {lexicalEnvironment});
	const initializerContResult = node.initializer == null ? undefined : continuation(node.initializer, {lexicalEnvironment});

	const isIdentical = nameContResult === node.name && typeContResult === node.type && initializerContResult === node.initializer;

	if (isIdentical) {
		return node;
	}

	return typescript.updatePropertySignature(node, node.modifiers, nameContResult, node.questionToken, typeContResult, initializerContResult);
}
