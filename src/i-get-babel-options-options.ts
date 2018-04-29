import {Browserslist} from "./browserslist";
import {ParsedCommandLine} from "typescript";

export interface IGetBabelOptionsOptions {
	filename: string;
	relativeFilename: string;
	typescriptOptions: ParsedCommandLine;
	browserslist: Browserslist;
	additionalPlugins?: {}[];
	additionalPresets?: {}[];
}