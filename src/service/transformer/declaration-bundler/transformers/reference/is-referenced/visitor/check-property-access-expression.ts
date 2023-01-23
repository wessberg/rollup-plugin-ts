import type {ReferenceVisitorOptions} from "../reference-visitor-options.js";
import type {TS} from "../../../../../../../type/ts.js";

export function checkPropertyAccessExpression({node, continuation}: ReferenceVisitorOptions<TS.PropertyAccessExpression>): string[] {
	return continuation(node.expression);
}
