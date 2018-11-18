import {FoveaDiagnostic} from "../../diagnostic/fovea-diagnostic";
import {TypeChecker} from "typescript";
import {ISourceFileTransformerContext} from "../transformer/i-source-file-transformer-context";
import {ISourceFileValidatorContext} from "../validator/validator/i-source-file-validator-context";
import {SourceFileContextKind} from "./source-file-context-kind";

export interface ISourceFileContext {
	kind: SourceFileContextKind;
	typeChecker: TypeChecker;
	addDiagnostics (...diagnostics: FoveaDiagnostic[]): void;
}

export type SourceFileContext = ISourceFileTransformerContext|ISourceFileValidatorContext;