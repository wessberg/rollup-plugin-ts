import {Diagnostic} from "typescript";

export interface IExtendedDiagnostic extends Diagnostic {
	scope?: string;
}
