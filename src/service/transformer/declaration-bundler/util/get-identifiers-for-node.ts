import {forEachChild, Node, SourceFile} from "typescript";
import {Resolver} from "../../../../util/resolve-id/resolver";
import {LocalSymbol, LocalSymbolMap} from "../../declaration-pre-bundler/declaration-pre-bundler-options";
import {traceIdentifiers} from "../../declaration-pre-bundler/deconflicter/visitor/trace-identifiers/trace-identifiers";

export type NodeIdentifierCache = WeakMap<Node, LocalSymbolMap>;

export interface GetIdentifiersWithCacheOptions {
	node: Node;
	sourceFile: SourceFile;
	resolver: Resolver;
	nodeIdentifierCache: NodeIdentifierCache;
}

export function getIdentifiersForNode({node, ...rest}: GetIdentifiersWithCacheOptions, identifiers: LocalSymbolMap = new Map()): LocalSymbolMap {
	if (rest.nodeIdentifierCache.has(node)) {
		return rest.nodeIdentifierCache.get(node)!;
	} else {
		const localSymbols = getIdentifiers({...rest, node}, identifiers);
		rest.nodeIdentifierCache.set(node, localSymbols);
		return localSymbols;
	}
}

function getIdentifiers({node, ...rest}: GetIdentifiersWithCacheOptions, identifiers: LocalSymbolMap): LocalSymbolMap {
	traceIdentifiers({
		...rest,
		node,
		continuation: nextNode => getIdentifiersForNode({...rest, node: nextNode}, identifiers),
		childContinuation: nextNode =>
			forEachChild(nextNode, nextNextNode => {
				getIdentifiersForNode({...rest, node: nextNextNode}, identifiers);
			}),
		addIdentifier(name: string, localSymbol: LocalSymbol): void {
			identifiers.set(name, localSymbol);
		}
	});
	return identifiers;
}
