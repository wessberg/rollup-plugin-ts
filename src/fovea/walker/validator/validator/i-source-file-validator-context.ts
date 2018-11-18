import {ISourceFileContext} from "../../shared/i-source-file-context";
import {SourceFileContextKind} from "../../shared/source-file-context-kind";

export interface ISourceFileValidatorContext extends ISourceFileContext {
	kind: SourceFileContextKind.VALIDATOR;
}