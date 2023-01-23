import type {ReferenceVisitorOptions} from "../reference-visitor-options.js";
import type {TS} from "../../../../../../../type/ts.js";
import {isSymbolIdentifier} from "../../../../util/is-symbol-identifier.js";

export function checkIdentifier({node, typescript}: ReferenceVisitorOptions<TS.Identifier>): string[] {
	return isSymbolIdentifier(node, typescript) ? [node.text.slice(1, -1)] : [(node as TS.Identifier).text];
}
