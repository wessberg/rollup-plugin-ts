import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {TS} from "../../../../../../../type/ts";
import {isSymbolIdentifier} from "../../../../util/is-symbol-identifier";

export function checkPropertySignature({node, continuation, typescript}: ReferenceVisitorOptions<TS.PropertySignature>): string[] {
	const referencedIdentifiers: string[] = [];

	if (!typescript.isIdentifier(node.name) || isSymbolIdentifier(node.name, typescript)) {
		referencedIdentifiers.push(...continuation(node.name));
	}

	if (node.initializer != null) {
		referencedIdentifiers.push(...continuation(node.initializer));
	}

	if (node.type != null) {
		referencedIdentifiers.push(...continuation(node.type));
	}
	return referencedIdentifiers;
}
