import {IMutableFoveaStats} from "../../stats/i-fovea-stats";
import {TransformationContext} from "typescript";
import {ISourceFileContext} from "../shared/i-source-file-context";
import {SourceFileContextKind} from "../shared/source-file-context-kind";

export interface ISourceFileTransformerContext extends ISourceFileContext {
	kind: SourceFileContextKind.TRANSFORMER;
	transformationContext: TransformationContext;
	updateStats (stats: Partial<IMutableFoveaStats>): void;
}