import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {VariableStatement} from "typescript";

export function checkVariableStatement({node, continuation, markIdentifiersAsReferenced}: ReferenceVisitorOptions<VariableStatement>): string[] {
	const referencedIdentifiers = continuation(node.declarationList);
	markIdentifiersAsReferenced(node, ...referencedIdentifiers);

	return referencedIdentifiers;
}
