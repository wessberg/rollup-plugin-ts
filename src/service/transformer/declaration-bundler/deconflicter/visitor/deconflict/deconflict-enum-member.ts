import {DeconflicterVisitorOptions} from "../../deconflicter-visitor-options";
import {TS} from "../../../../../../type/ts";

/**
 * Deconflicts the given EnumMember.
 */
export function deconflictEnumMember({
	node,
	continuation,
	lexicalEnvironment,
	typescript
}: DeconflicterVisitorOptions<TS.EnumMember>): TS.EnumMember | undefined {
	const nameContResult = typescript.isIdentifier(node.name) ? node.name : continuation(node.name, {lexicalEnvironment});
	const initializerContResult = node.initializer == null ? undefined : continuation(node.initializer, {lexicalEnvironment});

	const isIdentical = nameContResult === node.name && initializerContResult === node.initializer;

	if (isIdentical) {
		return node;
	}

	return typescript.updateEnumMember(node, nameContResult, initializerContResult);
}
