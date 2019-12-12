import {getSymbolAtLocation} from "./get-symbol-at-location";
import {SourceFileBundlerVisitorOptions} from "../transformers/source-file-bundler/source-file-bundler-visitor-options";
import {TS} from "../../../../type/ts";
import {cloneNode} from "@wessberg/ts-clone-node";
import {isTypescriptNode} from "./is-typescript-node";

export interface CloneSymbolsOptions<T extends TS.Node>
	extends Pick<SourceFileBundlerVisitorOptions, "nodeToOriginalSymbolMap" | "typescript" | "typeChecker"> {
	node: T;
}

const preservedNodes = new WeakSet<TS.Node>();

export function preserveSymbols<T extends TS.Node>(newNode: T, options: CloneSymbolsOptions<T>): T {
	if (preservedNodes.has(newNode) || newNode === options.node) return newNode;
	preservedNodes.add(newNode);

	for (const [key, value] of Object.entries(options.node)) {
		const values = Array.isArray(value) ? value : [value];

		const newNodeProperty = (newNode[key as keyof typeof newNode] as unknown) as TS.Node;
		const newNodeProperties = Array.isArray(newNodeProperty) ? newNodeProperty : [newNodeProperty];

		for (let i = 0; i < values.length; i++) {
			const currentValue = values[i];
			const currentNewNodeProperty = newNodeProperties[i];

			if (isTypescriptNode(currentValue) && currentNewNodeProperty != null) {
				const symbol = getSymbolAtLocation({...options, node: currentValue});

				if (symbol != null) {
					options.nodeToOriginalSymbolMap.set(currentNewNodeProperty, symbol);
				}

				preserveSymbols(currentNewNodeProperty, {...options, node: currentValue});
			}
		}
	}
	options.nodeToOriginalSymbolMap.set(newNode, getSymbolAtLocation(options));
	return newNode;
}

export function cloneNodeWithSymbols<T extends TS.Node>(options: CloneSymbolsOptions<T>): T {
	const clonedNode = cloneNode(options.node);

	preserveSymbols(clonedNode, options);

	return clonedNode;
}
