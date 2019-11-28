import {Resolver} from "../../../../util/resolve-id/resolver";
import {LocalSymbol, LocalSymbolMap} from "../../declaration-pre-bundler/declaration-pre-bundler-options";
import {traceIdentifiers} from "../../declaration-pre-bundler/track-locals/visitor/trace-identifiers/trace-identifiers";
import {TS} from "../../../../type/ts";

export type NodeIdentifierCache = WeakMap<TS.Node, LocalSymbolMap>;

export interface GetIdentifiersWithCacheOptions {
	typescript: typeof TS;
	node: TS.Node;
	sourceFile: TS.SourceFile;
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
			rest.typescript.forEachChild(nextNode, nextNextNode => {
				getIdentifiersForNode({...rest, node: nextNextNode}, identifiers);
			}),
		addIdentifier(name: string, localSymbol: LocalSymbol): void {
			identifiers.set(name, localSymbol);
		}
	});
	return identifiers;
}
