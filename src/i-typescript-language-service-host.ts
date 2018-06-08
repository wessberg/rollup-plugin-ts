import {Diagnostic, LanguageService, LanguageServiceHost, ParsedCommandLine} from "typescript";
import {ITypescriptLanguageServiceEmitResult} from "./i-typescript-language-service-emit-result";
import {ITypescriptLanguageServiceFileBase} from "./i-typescript-language-service-file";

export interface ITypescriptLanguageServiceHost extends LanguageServiceHost {
	readonly host: LanguageService;
	addFile (file: ITypescriptLanguageServiceFileBase): void;
	removeFile (fileName: string): void;
	getAllText (): string[];
	emit (fileName: string, onlyDeclarations?: boolean): ITypescriptLanguageServiceEmitResult[];
	getAllDiagnostics (): ReadonlyArray<Diagnostic>;
	getTypescriptOptions (): ParsedCommandLine;
	setTypescriptOptions (options: ParsedCommandLine): void;
	directoryExists (directoryName: string): boolean;
	getCurrentDirectory (): string;
	fileExists (path: string): boolean;
	readDirectory (path: string, extensions?: ReadonlyArray<string>, exclude?: ReadonlyArray<string>, include?: ReadonlyArray<string>, depth?: number): string[];
	readFile (path: string, encoding?: string): string | undefined;
	useCaseSensitiveFileNames (): boolean;
}