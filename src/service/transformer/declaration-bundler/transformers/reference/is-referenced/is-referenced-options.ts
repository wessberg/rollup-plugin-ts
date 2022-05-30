import {ReferenceCache, SourceFileToNodeToReferencedIdentifiersCache} from "../cache/reference-cache.js";
import {TS} from "../../../../../../type/ts.js";
import {GetIdentifiersWithCacheOptions} from "../../trace-identifiers/trace-identifiers.js";

export interface IsReferencedOptions<T extends TS.Node> extends GetIdentifiersWithCacheOptions {
	referenceCache: ReferenceCache;
	sourceFileToNodeToReferencedIdentifiersCache: SourceFileToNodeToReferencedIdentifiersCache;
	seenNodes?: Set<TS.Node>;
	node: T;
	referencedNode?: TS.Node;
}
