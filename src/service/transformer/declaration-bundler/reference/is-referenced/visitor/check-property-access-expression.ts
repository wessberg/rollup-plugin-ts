import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {TS} from "../../../../../../type/ts";

export function checkPropertyAccessExpression({node, continuation}: ReferenceVisitorOptions<TS.PropertyAccessExpression>): string[] {
	return continuation(node.expression);
}
