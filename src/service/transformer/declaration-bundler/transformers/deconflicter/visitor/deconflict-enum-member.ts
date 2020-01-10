import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";
import {preserveMeta} from "../../../util/clone-node-with-meta";

/**
 * Deconflicts the given EnumMember.
 */
export function deconflictEnumMember(options: DeconflicterVisitorOptions<TS.EnumMember>): TS.EnumMember | undefined {
	const {node, continuation, lexicalEnvironment, typescript} = options;
	const nameContResult = typescript.isIdentifier(node.name) ? node.name : continuation(node.name, {lexicalEnvironment});
	const initializerContResult = node.initializer == null ? undefined : continuation(node.initializer, {lexicalEnvironment});

	const isIdentical = nameContResult === node.name && initializerContResult === node.initializer;

	if (isIdentical) {
		return node;
	}

	return preserveMeta(typescript.updateEnumMember(node, nameContResult, initializerContResult), node, options);
}
