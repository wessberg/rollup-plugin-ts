import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";
import {preserveSymbols} from "../../../util/clone-node-with-symbols";

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

	return preserveSymbols(typescript.updateEnumMember(node, nameContResult, initializerContResult), options);
}
