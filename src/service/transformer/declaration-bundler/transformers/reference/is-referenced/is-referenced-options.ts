import type {ReferenceCache, SourceFileToNodeToReferencedIdentifiersCache} from "../cache/reference-cache.js";
import type {TS} from "../../../../../../type/ts.js";
import type {GetIdentifiersWithCacheOptions} from "../../trace-identifiers/trace-identifiers.js";

export interface IsReferencedOptions<T extends TS.Node> extends GetIdentifiersWithCacheOptions {
	referenceCache: ReferenceCache;
	sourceFileToNodeToReferencedIdentifiersCache: SourceFileToNodeToReferencedIdentifiersCache;
	seenNodes?: Set<TS.Node>;
	node: T;
	referencedNode?: TS.Node;
}
