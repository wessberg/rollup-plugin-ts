import type {TS} from "../../../../../../type/ts.js";
import type {TrackImportsTransformerVisitorOptions} from "../track-imports-transformer-visitor-options.js";

export function visitModuleDeclaration({node, ...options}: TrackImportsTransformerVisitorOptions<TS.ModuleDeclaration>): void {
	if (node.body == null) return;
	return options.childContinuation(node.body);
}
