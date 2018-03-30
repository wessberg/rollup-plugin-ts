import {IScriptSnapshot} from "typescript";
export interface ITypescriptLanguageServiceFileBase {
	fileName: string;
	text: string;
	isMainEntry: boolean;
}

export interface ITypescriptLanguageServiceFile extends ITypescriptLanguageServiceFileBase {
	version: string;
	file: IScriptSnapshot;
}