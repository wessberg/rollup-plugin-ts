import {SourceMap} from "rollup";
import {Browserslist} from "./browserslist";
import {ParsedCommandLine} from "typescript";

export interface IBabelUserConfigurableOptions {
	comments: boolean;
	additionalPresets: {}[];
	additionalPlugins: {}[];
}

export interface IGetBabelOptionsOptions extends Partial<IBabelUserConfigurableOptions> {
	filename: string;
	relativeFilename: string;
	typescriptOptions: ParsedCommandLine;
	inputSourceMap: SourceMap;
	browserslist: Browserslist;
}