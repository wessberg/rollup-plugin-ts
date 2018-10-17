import {SourceDescription} from "rollup";

export interface IFlattenDeclarationsFromRollupChunkResult {
	sourceDescription: SourceDescription;
	declarationFilename: string;
	declarationMapFilename: string;
}