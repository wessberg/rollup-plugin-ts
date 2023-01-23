import type {DeconflicterVisitorOptions} from "../deconflicter-visitor-options.js";
import type {TS} from "../../../../../../type/ts.js";
import {preserveMeta} from "../../../util/clone-node-with-meta.js";

/**
 * Deconflicts the given EnumMember.
 */
export function deconflictEnumMember(options: DeconflicterVisitorOptions<TS.EnumMember>): TS.EnumMember | undefined {
	const {node, continuation, lexicalEnvironment, typescript, factory} = options;
	const nameContResult = typescript.isIdentifier(node.name) ? node.name : continuation(node.name, {lexicalEnvironment});
	const initializerContResult = node.initializer == null ? undefined : continuation(node.initializer, {lexicalEnvironment});

	const isIdentical = nameContResult === node.name && initializerContResult === node.initializer;

	if (isIdentical) {
		return node;
	}

	return preserveMeta(factory.updateEnumMember(node, nameContResult, initializerContResult), node, options);
}
