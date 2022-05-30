import {ReferenceVisitorOptions} from "../reference-visitor-options.js";
import {TS} from "../../../../../../../type/ts.js";

export function checkQualifiedName({node, continuation}: ReferenceVisitorOptions<TS.QualifiedName>): string[] {
	return continuation(node.left);
}
