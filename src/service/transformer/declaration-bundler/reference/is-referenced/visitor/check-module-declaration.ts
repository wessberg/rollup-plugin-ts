import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {TS} from "../../../../../../type/ts";

export function checkModuleDeclaration({node, continuation, markIdentifiersAsReferenced}: ReferenceVisitorOptions<TS.ModuleDeclaration>): string[] {
	const referencedIdentifiers: string[] = [];
	if (node.body != null) {
		referencedIdentifiers.push(...continuation(node.body));
	}

	markIdentifiersAsReferenced(node, ...referencedIdentifiers);
	return referencedIdentifiers;
}
