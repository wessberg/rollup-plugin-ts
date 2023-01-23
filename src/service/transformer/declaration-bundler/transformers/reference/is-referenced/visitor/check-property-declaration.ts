import type {ReferenceVisitorOptions} from "../reference-visitor-options.js";
import type {TS} from "../../../../../../../type/ts.js";

export function checkPropertyDeclaration({node, continuation, typescript}: ReferenceVisitorOptions<TS.PropertyDeclaration>): string[] {
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
