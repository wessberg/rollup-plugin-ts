import {ModuleBlockExtractorVisitorOptions} from "../module-block-extractor-visitor-options";
import {TS} from "../../../../../../type/ts";

export function visitModuleDeclaration({node, typescript}: ModuleBlockExtractorVisitorOptions<TS.ModuleDeclaration>): TS.VisitResult<TS.Node> {
	if (node.body == null) return undefined;
	if (typescript.isModuleBlock(node.body)) {
		return [...node.body.statements];
	}

	return node.body;
}
