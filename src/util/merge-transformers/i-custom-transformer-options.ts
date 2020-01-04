import {IExtendedDiagnostic} from "../../diagnostic/i-extended-diagnostic";
import {TS} from "../../type/ts";

export interface ICustomTransformerOptions {
	program: TS.Program | undefined;
	printer: TS.Printer;
	typescript: typeof TS;
	addDiagnostics(...diagnostics: IExtendedDiagnostic[]): void;
}

export type CustomTransformersFunction = (options: ICustomTransformerOptions) => TS.CustomTransformers;
