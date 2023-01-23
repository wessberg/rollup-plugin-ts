import type {ModuleMergerVisitorOptions, VisitResult} from "../module-merger-visitor-options.js";
import type {TS} from "../../../../../../type/ts.js";

export function visitSourceFile(options: ModuleMergerVisitorOptions<TS.SourceFile>): VisitResult<TS.SourceFile> {
	for (const otherEntrySourceFileForChunk of options.otherEntrySourceFilesForChunk) {
		options.prependNodes(...options.includeSourceFile(otherEntrySourceFileForChunk, {allowExports: true}));
	}

	return options.childContinuation(options.node, undefined);
}
