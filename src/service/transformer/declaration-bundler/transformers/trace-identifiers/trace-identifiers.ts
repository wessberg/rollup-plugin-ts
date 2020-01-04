import {TS} from "../../../../../type/ts";
import {traceIdentifiersForNode} from "./visitor/trace-identifiers-for-node";

export interface GetIdentifiersWithCacheOptions {
	typescript: typeof TS;
	node: TS.Node;
	sourceFile: TS.SourceFile;
}

export function traceIdentifiers({node, ...rest}: GetIdentifiersWithCacheOptions, identifiers: Set<string> = new Set()): Set<string> {
	return getIdentifiers({...rest, node}, identifiers);
}

function getIdentifiers({node, ...rest}: GetIdentifiersWithCacheOptions, identifiers: Set<string>): Set<string> {
	traceIdentifiersForNode({
		...rest,
		node,
		continuation: nextNode => getIdentifiers({...rest, node: nextNode}, identifiers),
		childContinuation: nextNode =>
			rest.typescript.forEachChild(nextNode, nextNextNode => {
				getIdentifiers({...rest, node: nextNextNode}, identifiers);
			}),
		addIdentifier(name: string): void {
			identifiers.add(name);
		}
	});
	return identifiers;
}
