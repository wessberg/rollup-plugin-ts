import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {PropertyAccessExpression} from "typescript";

export function checkPropertyAccessExpression({node, continuation}: ReferenceVisitorOptions<PropertyAccessExpression>): string[] {
	return continuation(node.expression);
}
