import type {ReferenceVisitorOptions} from "../reference-visitor-options.js";
import type {TS} from "../../../../../../../type/ts.js";

export function checkQualifiedName({node, continuation}: ReferenceVisitorOptions<TS.QualifiedName>): string[] {
	return continuation(node.left);
}
