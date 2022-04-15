import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {TS} from "../../../../../../../type/ts";

export function checkImportEqualsDeclaration({node, continuation, markIdentifiersAsReferenced}: ReferenceVisitorOptions<TS.ImportEqualsDeclaration>): string[] {
	const referencedIdentifiers: string[] = [];
	if (node.moduleReference != null) {
		referencedIdentifiers.push(...continuation(node.moduleReference));
		
	}

	markIdentifiersAsReferenced(node, ...referencedIdentifiers);
	return referencedIdentifiers;
}
