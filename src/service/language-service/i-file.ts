import {ScriptKind, IScriptSnapshot} from "typescript";

export interface IFileInput {
	file: string;
	code: string;
}

export interface IFile {
	file: string;
	code: string;
	scriptKind: ScriptKind;
	snapshot: IScriptSnapshot;
	version: number;
}