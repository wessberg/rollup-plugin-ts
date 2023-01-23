import type {ReferenceVisitorOptions} from "../reference-visitor-options.js";
import type {TS} from "../../../../../../../type/ts.js";

export function checkModuleDeclaration({node, continuation, markIdentifiersAsReferenced}: ReferenceVisitorOptions<TS.ModuleDeclaration>): string[] {
	const referencedIdentifiers: string[] = [];
	if (node.body != null) {
		referencedIdentifiers.push(...continuation(node.body));
	}

	markIdentifiersAsReferenced(node, ...referencedIdentifiers);
	return referencedIdentifiers;
}
