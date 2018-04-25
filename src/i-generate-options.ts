import {OutputOptions} from "rollup";

export interface IGenerateOptions extends OutputOptions {
	bundle?: {
		modules: {id: string}[];
	};
	usedModules?: {id: string}[];
}