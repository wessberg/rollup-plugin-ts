import {ReferenceCache, SourceFileToNodeToReferencedIdentifiersCache} from "../cache/reference-cache";
import {GetIdentifiersWithCacheOptions} from "../../util/get-identifiers-for-node";
import {TS} from "../../../../../type/ts";

export interface IsReferencedOptions<T extends TS.Node> extends GetIdentifiersWithCacheOptions {
	referenceCache: ReferenceCache;
	sourceFileToNodeToReferencedIdentifiersCache: SourceFileToNodeToReferencedIdentifiersCache;
	seenNodes?: Set<TS.Node>;
	node: T;
}
