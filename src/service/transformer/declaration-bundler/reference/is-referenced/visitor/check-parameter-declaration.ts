import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {TS} from "../../../../../../type/ts";

export function checkParameterDeclaration({node, continuation, typescript}: ReferenceVisitorOptions<TS.ParameterDeclaration>): string[] {
	const referencedIdentifiers: string[] = [];

	if (!typescript.isIdentifier(node.name)) {
		referencedIdentifiers.push(...continuation(node.name));
	}

	if (node.type != null) {
		referencedIdentifiers.push(...continuation(node.type));
	}

	if (node.initializer != null) {
		referencedIdentifiers.push(...continuation(node.initializer));
	}

	return referencedIdentifiers;
}
