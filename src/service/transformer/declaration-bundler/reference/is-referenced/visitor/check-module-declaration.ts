import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {ModuleDeclaration} from "typescript";

export function checkModuleDeclaration({node, continuation, markIdentifiersAsReferenced}: ReferenceVisitorOptions<ModuleDeclaration>): string[] {
	const referencedIdentifiers: string[] = [];
	if (node.body != null) {
		referencedIdentifiers.push(...continuation(node.body));
	}

	markIdentifiersAsReferenced(node, ...referencedIdentifiers);
	return referencedIdentifiers;
}
