import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {TS} from "../../../../../../../type/ts";

export function checkMethodSignature({node, continuation, typescript}: ReferenceVisitorOptions<TS.MethodSignature>): string[] {
	const referencedIdentifiers: string[] = [];

	if (!typescript.isIdentifier(node.name)) {
		referencedIdentifiers.push(...continuation(node.name));
	}
	for (const parameter of node.parameters) {
		referencedIdentifiers.push(...continuation(parameter));
	}

	if (node.typeParameters != null) {
		for (const typeParameter of node.typeParameters) {
			referencedIdentifiers.push(...continuation(typeParameter));
		}
	}

	if (node.type != null) {
		referencedIdentifiers.push(...continuation(node.type));
	}

	return referencedIdentifiers;
}
