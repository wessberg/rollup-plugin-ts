import {ReferenceVisitorOptions} from "../reference-visitor-options.js";
import {TS} from "../../../../../../../type/ts.js";

export function checkTypeReferenceNode({node, continuation}: ReferenceVisitorOptions<TS.TypeReferenceNode>): string[] {
	const referencedIdentifiers: string[] = [];

	if (node.typeName != null) {
		referencedIdentifiers.push(...continuation(node.typeName));
	}

	if (node.typeArguments != null) {
		for (const typeArgument of node.typeArguments) {
			referencedIdentifiers.push(...continuation(typeArgument));
		}
	}

	return referencedIdentifiers;
}
