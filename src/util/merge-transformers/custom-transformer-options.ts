import {ExtendedDiagnostic} from "../../diagnostic/extended-diagnostic";
import {TS} from "../../type/ts";

export interface CustomTransformerOptions {
	program: TS.Program | undefined;
	printer: TS.Printer;
	typescript: typeof TS;
	addDiagnostics(...diagnostics: ExtendedDiagnostic[]): void;
}

export type CustomTransformersFunction = (options: CustomTransformerOptions) => TS.CustomTransformers;
