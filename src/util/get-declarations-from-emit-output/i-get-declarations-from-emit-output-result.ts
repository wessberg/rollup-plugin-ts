import {OutputFile} from "typescript";

export interface IGetDeclarationsFromEmitOutputResult {
	code: OutputFile[];
	maps: OutputFile[];
}
