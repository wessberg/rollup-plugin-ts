import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {FunctionDeclaration} from "typescript";

export function checkFunctionDeclaration({node, continuation}: ReferenceVisitorOptions<FunctionDeclaration>): boolean {
	for (const parameter of node.parameters) {
		if (continuation(parameter)) return true;
	}

	if (node.typeParameters != null) {
		for (const typeParameter of node.typeParameters) {
			if (continuation(typeParameter)) return true;
		}
	}

	if (node.body != null && continuation(node.body)) return true;

	return false;
}
