import {TS} from "../../../../type/ts";
import {getSymbolFlagsForNode} from "./get-symbol-flags-for-node";
import {SourceFileBundlerVisitorOptions} from "../transformers/source-file-bundler/source-file-bundler-visitor-options";

export interface GetSymbolAtLocationOptions extends Pick<SourceFileBundlerVisitorOptions, "nodeToOriginalSymbolMap" | "typeChecker" | "typescript"> {
	node: TS.Node;
}

export function getSymbolAtLocation({node, typescript, typeChecker, nodeToOriginalSymbolMap}: GetSymbolAtLocationOptions): TS.Symbol {
	return (
		nodeToOriginalSymbolMap.get(node) ??
		typeChecker.getSymbolAtLocation(node) ??
		typeChecker.getSymbolsInScope(node, getSymbolFlagsForNode(node, typescript))[0]
	);
}
