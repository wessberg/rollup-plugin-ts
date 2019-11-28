import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {TS} from "../../../../../../type/ts";

export function checkIdentifier({node}: ReferenceVisitorOptions<TS.Identifier>): string[] {
	return [node.text];
}
