import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {TS} from "../../../../../../../type/ts";

export function checkQualifiedName({node, continuation}: ReferenceVisitorOptions<TS.QualifiedName>): string[] {
	return continuation(node.left);
}
