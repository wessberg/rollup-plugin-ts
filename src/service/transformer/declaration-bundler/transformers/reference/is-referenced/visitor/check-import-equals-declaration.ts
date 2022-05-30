import {ReferenceVisitorOptions} from "../reference-visitor-options.js";
import {TS} from "../../../../../../../type/ts.js";

export function checkImportEqualsDeclaration({node, continuation, markIdentifiersAsReferenced}: ReferenceVisitorOptions<TS.ImportEqualsDeclaration>): string[] {
	const referencedIdentifiers: string[] = [];
	if (node.moduleReference != null) {
		referencedIdentifiers.push(...continuation(node.moduleReference));
	}

	markIdentifiersAsReferenced(node, ...referencedIdentifiers);
	return referencedIdentifiers;
}
