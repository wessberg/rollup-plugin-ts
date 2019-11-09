import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {FunctionExpression} from "typescript";

export function checkFunctionExpression({node, continuation, markIdentifiersAsReferenced}: ReferenceVisitorOptions<FunctionExpression>): string[] {
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
