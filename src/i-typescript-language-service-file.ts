import {IScriptSnapshot} from "typescript";
export interface ITypescriptLanguageServiceFileBase {
	fileName: string;
	text: string;
}

export interface ITypescriptLanguageServiceFile extends ITypescriptLanguageServiceFileBase {
	version: string;
	file: IScriptSnapshot;
}