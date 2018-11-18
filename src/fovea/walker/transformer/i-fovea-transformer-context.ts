import {IImmutableFoveaStats} from "../../stats/i-fovea-stats";

export interface IFoveaTransformerContext {
	readonly dryRun: boolean;
	onStats (fileName: string, stats: IImmutableFoveaStats): void;
}