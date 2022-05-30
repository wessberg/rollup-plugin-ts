import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options.js";
import {TS} from "../../../../../../type/ts.js";
import {preserveMeta} from "../../../util/clone-node-with-meta.js";

/**
 * Deconflicts the given PropertySignature.
 */
export function deconflictPropertySignature(options: DeconflicterVisitorOptions<TS.PropertySignature>): TS.PropertySignature | undefined {
	const {node, continuation, lexicalEnvironment, factory, typescript} = options;
	const nameContResult = typescript.isIdentifier(node.name) ? node.name : continuation(node.name, {lexicalEnvironment});

	const typeContResult = node.type == null ? undefined : continuation(node.type, {lexicalEnvironment});
	const initializerContResult = node.initializer == null ? undefined : continuation(node.initializer, {lexicalEnvironment});

	const isIdentical = nameContResult === node.name && typeContResult === node.type && initializerContResult === node.initializer;

	if (isIdentical) {
		return node;
	}

	const updated = preserveMeta(factory.updatePropertySignature(node, node.modifiers, nameContResult, node.questionToken, typeContResult), node, options);
	updated.initializer = initializerContResult;
	return updated;
}
