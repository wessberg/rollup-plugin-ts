import {TS} from "../../../../type/ts.js";
import {getSymbolFlagsForNode} from "./get-symbol-flags-for-node.js";
import {SafeNode} from "../../../../type/safe-node.js";
import {getOriginalNode} from "./get-original-node.js";

export interface GetSymbolAtLocationOptions {
	node: SafeNode;
	typeChecker: TS.TypeChecker;
	typescript: typeof TS;
}

export function getSymbolAtLocation({node, typescript, typeChecker}: GetSymbolAtLocationOptions): TS.Symbol {
	const originalNode = getOriginalNode(node, typescript);

	return (
		originalNode._symbol ??
		originalNode.symbol ??
		typeChecker.getSymbolAtLocation(originalNode) ??
		typeChecker.getSymbolsInScope(originalNode, getSymbolFlagsForNode(originalNode, typescript))[0]
	);
}
