import {ModuleMergerVisitorOptions, VisitResult} from "../module-merger-visitor-options";
import {TS} from "../../../../../../type/ts";

export function visitSourceFile(options: ModuleMergerVisitorOptions<TS.SourceFile>): VisitResult<TS.SourceFile> {
	for (const otherEntrySourceFileForChunk of options.otherEntrySourceFilesForChunk) {
		options.prependNodes(...options.includeSourceFile(otherEntrySourceFileForChunk, {allowExports: true}));
	}

	return options.childContinuation(options.node, undefined);
}
