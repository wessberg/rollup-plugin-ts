import {SourceMap} from "rollup";
import {Browserslist} from "./browserslist";
import {ParsedCommandLine} from "typescript";

export interface IGetBabelOptionsOptions {
	filename: string;
	relativeFilename: string;
	typescriptOptions: ParsedCommandLine;
	inputSourceMap: SourceMap;
	browserslist: Browserslist;
	additionalPlugins?: {}[];
	additionalPresets?: {}[];
}