import {SourceFileContext} from "../../../shared/i-source-file-context";

export interface ICreateNodeEvaluatorOptions {
	context: SourceFileContext;
	deterministic: boolean;
	maxOps: number;
}