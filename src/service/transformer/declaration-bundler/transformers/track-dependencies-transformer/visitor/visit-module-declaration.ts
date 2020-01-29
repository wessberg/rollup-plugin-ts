import {TS} from "../../../../../../type/ts";
import {TrackDependenciesTransformerVisitorOptions} from "../track-dependencies-transformer-visitor-options";

export function visitModuleDeclaration({node, ...options}: TrackDependenciesTransformerVisitorOptions<TS.ModuleDeclaration>): void {
	if (node.body == null) return;
	return options.childContinuation(node.body);
}
