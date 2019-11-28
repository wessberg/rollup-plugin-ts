import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../../type/ts";

/**
 * Deconflicts the given PropertyAssignment.
 */
export function deconflictPropertyAssignment({
	node,
	continuation,
	lexicalEnvironment,
	typescript
}: DeconflicterVisitorOptions<TS.PropertyAssignment>): TS.PropertyAssignment | undefined {
	const nameContResult = typescript.isIdentifier(node.name) ? node.name : continuation(node.name, {lexicalEnvironment});
	const initializerContResult = node.initializer == null ? undefined : continuation(node.initializer, {lexicalEnvironment});

	const isIdentical = nameContResult === node.name && initializerContResult === node.initializer;

	if (isIdentical) {
		return node;
	}

	return typescript.updatePropertyAssignment(node, nameContResult, initializerContResult!);
}
