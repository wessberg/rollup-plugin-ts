import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {FunctionExpression} from "typescript";

export function checkFunctionExpression({node, continuation}: ReferenceVisitorOptions<FunctionExpression>): boolean {
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
