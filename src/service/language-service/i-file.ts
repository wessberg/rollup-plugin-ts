import {IExtendedDiagnostic} from "../../diagnostic/i-extended-diagnostic";
import {TS} from "../../type/ts";

export interface IFileInput {
	file: string;
	code: string;
}

export interface IFile {
	file: string;
	code: string;
	scriptKind: TS.ScriptKind;
	snapshot: TS.IScriptSnapshot;
	version: number;
	transformerDiagnostics: IExtendedDiagnostic[];
}
