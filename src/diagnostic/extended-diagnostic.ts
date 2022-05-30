import {TS} from "../type/ts.js";

export interface ExtendedDiagnostic extends TS.Diagnostic {
	scope?: string;
}
