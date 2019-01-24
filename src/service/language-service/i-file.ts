import {ScriptKind, IScriptSnapshot} from "typescript";
import {IExtendedDiagnostic} from "../../diagnostic/i-extended-diagnostic";

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
	transformerDiagnostics: IExtendedDiagnostic[];
}
