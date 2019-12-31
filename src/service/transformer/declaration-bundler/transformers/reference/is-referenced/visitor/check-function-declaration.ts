import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {TS} from "../../../../../../../type/ts";

export function checkFunctionDeclaration({
	node,
	continuation,
	markIdentifiersAsReferenced
}: ReferenceVisitorOptions<TS.FunctionDeclaration>): string[] {
	const referencedIdentifiers: string[] = [];
	for (const parameter of node.parameters) {
		referencedIdentifiers.push(...continuation(parameter));
	}

	if (node.typeParameters != null) {
		for (const typeParameter of node.typeParameters) {
			referencedIdentifiers.push(...continuation(typeParameter));
		}
	}

	if (node.body != null) {
		referencedIdentifiers.push(...continuation(node.body));
	}

	if (node.type != null) {
		referencedIdentifiers.push(...continuation(node.type));
	}

	markIdentifiersAsReferenced(node, ...referencedIdentifiers);
	return referencedIdentifiers;
}
