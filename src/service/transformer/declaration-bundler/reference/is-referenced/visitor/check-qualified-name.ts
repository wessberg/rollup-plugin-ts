import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {QualifiedName} from "typescript";

export function checkQualifiedName({node, continuation}: ReferenceVisitorOptions<QualifiedName>): string[] {
	return continuation(node.left);
}
