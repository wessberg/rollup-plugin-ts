import {ReferenceVisitorOptions} from "../reference-visitor-options";
import {TS} from "../../../../../../../type/ts";
import {isSymbolIdentifier} from "../../../../util/is-symbol-identifier";

export function checkIdentifier({node, typescript}: ReferenceVisitorOptions<TS.Identifier>): string[] {
	return isSymbolIdentifier(node, typescript) ? [node.text.slice(1, -1)] : [(node as TS.Identifier).text];
}
