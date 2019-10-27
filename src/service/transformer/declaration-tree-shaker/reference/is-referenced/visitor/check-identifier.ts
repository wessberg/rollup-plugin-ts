import {Identifier} from "typescript";
import {ReferenceVisitorOptions} from "../reference-visitor-options";

export function checkIdentifier({node, identifier}: ReferenceVisitorOptions<Identifier>): boolean {
	return identifier === node.text;
}
