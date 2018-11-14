import {FoveaDiagnostic} from "../diagnostic/fovea-diagnostic";
import {IImmutableFoveaStats} from "../stats/i-fovea-stats";

export interface IFoveaTransformerContext {
	readonly dryRun: boolean;
	onDiagnostics (fileName: string, diagnostics: FoveaDiagnostic[]): void;
	onStats (fileName: string, stats: IImmutableFoveaStats): void;
}