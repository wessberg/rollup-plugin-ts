import {visitModuleDeclaration} from "./visit-module-declaration";
import {ModuleBlockExtractorVisitorOptions} from "../module-block-extractor-visitor-options";
import {TS} from "../../../../../../type/ts";

export function visitNode<T extends TS.Node>({node, ...options}: ModuleBlockExtractorVisitorOptions<T>): TS.Node | TS.Node[] | undefined {
	if (options.typescript.isModuleDeclaration(node)) {
		return visitModuleDeclaration({...options, node});
	} else {
		return options.childContinuation(node);
	}
}
