import {CrossChunkReferenceTrackerOptions} from "../../cross-chunk-reference-tracker-options";
import {TS} from "../../../../../type/ts";

export interface SourceFileTrackerVisitorOptions extends CrossChunkReferenceTrackerOptions {
	context: TS.TransformationContext;
	sourceFile: TS.SourceFile;
}
