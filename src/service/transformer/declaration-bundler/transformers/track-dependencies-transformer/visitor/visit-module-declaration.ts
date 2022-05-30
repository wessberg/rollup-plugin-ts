import {TS} from "../../../../../../type/ts.js";
import {TrackDependenciesTransformerVisitorOptions} from "../track-dependencies-transformer-visitor-options.js";

export function visitModuleDeclaration({node, ...options}: TrackDependenciesTransformerVisitorOptions<TS.ModuleDeclaration>): void {
	if (node.body == null) return;
	return options.childContinuation(node.body);
}
