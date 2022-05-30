import {SourceFileBundlerVisitorOptions} from "../transformers/source-file-bundler/source-file-bundler-visitor-options.js";
import {TS} from "../../../../type/ts.js";
import {cloneNode, preserveNode, setParentNodes} from "ts-clone-node";
import {getSymbolAtLocation} from "./get-symbol-at-location.js";
import {SafeNode} from "../../../../type/safe-node.js";

export interface PreserveMetaOptions extends SourceFileBundlerVisitorOptions {}

export function preserveSymbols<T extends TS.Node>(node: T, otherNode: TS.Node, options: PreserveMetaOptions): T {
	if (node === otherNode) return node;

	(node as SafeNode)._symbol = getSymbolAtLocation({...options, node: otherNode});
	return node;
}

export function preserveMeta<T extends TS.Node>(newNode: T, oldNode: T, options: PreserveMetaOptions): T {
	return preserveNode(newNode, oldNode, options);
}

export function preserveParents<T extends TS.Node>(node: T, options: Pick<SourceFileBundlerVisitorOptions, "typescript">): T {
	return setParentNodes(node, {typescript: options.typescript, propertyName: "_parent", deep: true});
}

export function cloneNodeWithMeta<T extends TS.Node>(node: T, options: PreserveMetaOptions): T {
	return cloneNode<T>(node, options);
}
