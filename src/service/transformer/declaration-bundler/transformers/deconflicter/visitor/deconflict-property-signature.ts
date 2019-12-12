import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";
import {preserveSymbols} from "../../../util/clone-node-with-symbols";

/**
 * Deconflicts the given PropertySignature.
 */
export function deconflictPropertySignature(options: DeconflicterVisitorOptions<TS.PropertySignature>): TS.PropertySignature | undefined {
	const {node, continuation, lexicalEnvironment, typescript} = options;
	const nameContResult = typescript.isIdentifier(node.name) ? node.name : continuation(node.name, {lexicalEnvironment});

	const typeContResult = node.type == null ? undefined : continuation(node.type, {lexicalEnvironment});
	const initializerContResult = node.initializer == null ? undefined : continuation(node.initializer, {lexicalEnvironment});

	const isIdentical = nameContResult === node.name && typeContResult === node.type && initializerContResult === node.initializer;

	if (isIdentical) {
		return node;
	}

	return preserveSymbols(
		typescript.updatePropertySignature(node, node.modifiers, nameContResult, node.questionToken, typeContResult, initializerContResult),
		options
	);
}
