import {TS} from "../../../../../type/ts";
import {Resolver} from "../../../../../util/resolve-id/resolver";
import {traceIdentifiersForNode} from "./visitor/trace-identifiers-for-node";

export type NodeIdentifierCache = WeakMap<TS.Node, Set<string>>;

export interface GetIdentifiersWithCacheOptions {
	typescript: typeof TS;
	node: TS.Node;
	sourceFile: TS.SourceFile;
	resolver: Resolver;
	nodeIdentifierCache: NodeIdentifierCache;
}

export function traceIdentifiers({node, ...rest}: GetIdentifiersWithCacheOptions, identifiers: Set<string> = new Set()): Set<string> {
	if (rest.nodeIdentifierCache.has(node)) {
		return rest.nodeIdentifierCache.get(node)!;
	} else {
		const localSymbols = getIdentifiers({...rest, node}, identifiers);
		rest.nodeIdentifierCache.set(node, localSymbols);
		return localSymbols;
	}
}

function getIdentifiers({node, ...rest}: GetIdentifiersWithCacheOptions, identifiers: Set<string>): Set<string> {
	traceIdentifiersForNode({
		...rest,
		node,
		continuation: nextNode => traceIdentifiers({...rest, node: nextNode}, identifiers),
		childContinuation: nextNode =>
			rest.typescript.forEachChild(nextNode, nextNextNode => {
				traceIdentifiers({...rest, node: nextNextNode}, identifiers);
			}),
		addIdentifier(name: string): void {
			identifiers.add(name);
		}
	});
	return identifiers;
}
