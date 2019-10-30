import {Identifier} from "typescript";
import {ReferenceVisitorOptions} from "../reference-visitor-options";

export function checkIdentifier({node, identifiers}: ReferenceVisitorOptions<Identifier>): boolean {
	for (const identifier of identifiers.keys()) {
		if (identifier === node.text) return true;
	}
	return false;
}
