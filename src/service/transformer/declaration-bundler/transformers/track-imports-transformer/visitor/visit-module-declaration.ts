import {TS} from "../../../../../../type/ts";
import {TrackImportsTransformerVisitorOptions} from "../track-imports-transformer-visitor-options";

export function visitModuleDeclaration({node, typescript, ...options}: TrackImportsTransformerVisitorOptions<TS.ModuleDeclaration>): void {
	if (node.body == null) return;
	return options.childContinuation(node.body);
}
