import {ReferenceVisitorOptions} from "../reference-visitor-options.js";
import {TS} from "../../../../../../../type/ts.js";

export function checkBindingElement({node, continuation, typescript}: ReferenceVisitorOptions<TS.BindingElement>): string[] {
	const referencedIdentifiers: string[] = [];

	if (!typescript.isIdentifier(node.name)) {
		referencedIdentifiers.push(...continuation(node.name));
	}

	if (node.initializer != null) {
		referencedIdentifiers.push(...continuation(node.initializer));
	}

	if (node.propertyName != null && !typescript.isIdentifier(node.propertyName)) {
		referencedIdentifiers.push(...continuation(node.propertyName));
	}
	return referencedIdentifiers;
}
