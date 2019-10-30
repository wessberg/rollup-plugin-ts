import {forEachChild, Node, SourceFile} from "typescript";
import {Resolver} from "../../../../util/resolve-id/resolver";
import {LocalSymbol, LocalSymbolMap} from "../../declaration-pre-bundler/declaration-pre-bundler-options";
import {traceIdentifiers} from "../../declaration-pre-bundler/deconflicter/visitor/trace-identifiers/trace-identifiers";

export type NodeIdentifierCache = WeakMap<Node, LocalSymbolMap>;

export interface GetIdentifiersOptions {
	node: Node;
	sourceFile: SourceFile;
	resolver: Resolver;
}

export interface GetIdentifiersWithCacheOptions {
	node: Node;
	sourceFile: SourceFile;
	resolver: Resolver;
	nodeIdentifierCache: NodeIdentifierCache;
}

export function getIdentifiersForNode({nodeIdentifierCache, node, ...rest}: GetIdentifiersWithCacheOptions): LocalSymbolMap {
	if (nodeIdentifierCache.has(node)) {
		return nodeIdentifierCache.get(node)!;
	} else {
		const localSymbols = getIdentifiers({...rest, node});
		nodeIdentifierCache.set(node, localSymbols);
		return localSymbols;
	}
}

function getIdentifiers({node, ...rest}: GetIdentifiersOptions): LocalSymbolMap {
	const identifiers: LocalSymbolMap = new Map();

	traceIdentifiers({
		...rest,
		node,
		continuation: nextNode => getIdentifiers({...rest, node: nextNode}),
		childContinuation: nextNode => forEachChild(nextNode, nextNextNode => getIdentifiers({...rest, node: nextNextNode})),
		addIdentifier(name: string, localSymbol: LocalSymbol): void {
			identifiers.set(name, localSymbol);
		}
	});
	return identifiers;
}
