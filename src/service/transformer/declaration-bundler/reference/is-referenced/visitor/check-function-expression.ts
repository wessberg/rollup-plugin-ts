import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {FunctionExpression} from "typescript";

export function checkFunctionExpression({node, childContinuation}: ReferenceVisitorOptions<FunctionExpression>): boolean {
	for (const parameter of node.parameters) {
		if (childContinuation(parameter)) return true;
	}

	if (node.typeParameters != null) {
		for (const typeParameter of node.typeParameters) {
			if (childContinuation(typeParameter)) return true;
		}
	}

	if (node.body != null && childContinuation(node.body)) return true;

	return false;
}
