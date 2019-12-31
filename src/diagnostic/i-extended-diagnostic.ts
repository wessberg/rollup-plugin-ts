import {TS} from "../type/ts";

export interface IExtendedDiagnostic extends TS.Diagnostic {
	scope?: string;
}
