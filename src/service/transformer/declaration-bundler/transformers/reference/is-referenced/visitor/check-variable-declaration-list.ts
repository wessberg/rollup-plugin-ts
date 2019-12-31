import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {TS} from "../../../../../../../type/ts";

export function checkVariableDeclarationList({node, continuation}: ReferenceVisitorOptions<TS.VariableDeclarationList>): string[] {
	const referencedIdentifiers: string[] = [];

	for (const declaration of node.declarations) {
		referencedIdentifiers.push(...continuation(declaration));
	}

	return referencedIdentifiers;
}
