import {ReferenceCache, SourceFileToNodeToReferencedIdentifiersCache} from "../cache/reference-cache";
import {TS} from "../../../../../../type/ts";
import {GetIdentifiersWithCacheOptions} from "../../trace-identifiers/trace-identifiers";

export interface IsReferencedOptions<T extends TS.Node> extends GetIdentifiersWithCacheOptions {
	referenceCache: ReferenceCache;
	sourceFileToNodeToReferencedIdentifiersCache: SourceFileToNodeToReferencedIdentifiersCache;
	seenNodes?: Set<TS.Node>;
	node: T;
	referencedNode?: TS.Node;
}
