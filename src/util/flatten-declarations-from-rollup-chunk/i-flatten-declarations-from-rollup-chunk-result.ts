import {SourceDescription} from "rollup";

export interface IFlattenDeclarationsFromRollupChunkResult {
	sourceDescription: SourceDescription;
	declarationFilename: string;
	absoluteDeclarationFilename: string;
	declarationMapFilename: string;
	absoluteDeclarationMapFilename: string;
}