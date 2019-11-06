import {Identifier} from "typescript";
import {ReferenceVisitorOptions} from "../reference-visitor-options";

export function checkIdentifier({node}: ReferenceVisitorOptions<Identifier>): string[] {
	return [node.text];
}
