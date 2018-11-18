import {Program} from "typescript";
import {FoveaDiagnostic} from "../../diagnostic/fovea-diagnostic";

export interface IFoveaWalkerOptions {
	program: Program;
	addDiagnostics (...diagnostics: FoveaDiagnostic[]): void;
}