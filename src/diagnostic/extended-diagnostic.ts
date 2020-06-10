import {TS} from "../type/ts";

export interface ExtendedDiagnostic extends TS.Diagnostic {
	scope?: string;
}
