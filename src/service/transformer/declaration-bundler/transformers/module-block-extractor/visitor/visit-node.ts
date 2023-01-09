import {visitModuleDeclaration} from "./visit-module-declaration.js";
import {ModuleBlockExtractorVisitorOptions} from "../module-block-extractor-visitor-options.js";
import {TS} from "../../../../../../type/ts.js";

export function visitNode<T extends TS.Node>({node, ...options}: ModuleBlockExtractorVisitorOptions<T>): TS.Node | TS.Node[] | readonly TS.Node[] | undefined {
	if (options.typescript.isModuleDeclaration(node)) {
		return visitModuleDeclaration({...options, node});
	} else {
		return options.childContinuation(node);
	}
}
