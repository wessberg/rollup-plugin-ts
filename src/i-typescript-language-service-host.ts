import {Diagnostic, LanguageServiceHost, ParsedCommandLine} from "typescript";
import {ITypescriptLanguageServiceFileBase} from "./i-typescript-language-service-file";
import {ITypescriptLanguageServiceEmitResult} from "./i-typescript-language-service-emit-result";

export interface ITypescriptLanguageServiceHost extends LanguageServiceHost {
	addFile (file: ITypescriptLanguageServiceFileBase): void;
	removeFile (fileName: string): void;
	getAllText (): string[];
	emit (fileName: string, onlyDeclarations?: boolean): ITypescriptLanguageServiceEmitResult[];
	getAllDiagnostics (): ReadonlyArray<Diagnostic>;
	getTypescriptOptions (): ParsedCommandLine;
	setTypescriptOptions (options: ParsedCommandLine): void;
}