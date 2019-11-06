import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {VariableDeclarationList} from "typescript";

export function checkVariableDeclarationList ({node, continuation}: ReferenceVisitorOptions<VariableDeclarationList>): string[] {
	const referencedIdentifiers: string[] = [];

	for (const declaration of node.declarations) {
		referencedIdentifiers.push(...continuation(declaration));
	}

	return referencedIdentifiers;
}
