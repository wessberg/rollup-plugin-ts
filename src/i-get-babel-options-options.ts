import {SourceMap} from "rollup";
import {Browserslist} from "./browserslist";
import {ParsedCommandLine} from "typescript";

export interface IBabelUserConfigurableOptions {
	additionalPresets: {}[];
	additionalPlugins: {}[];

	// Code generation options
	retainLines: boolean;
	compact: boolean|"auto";
	minified: boolean;
	auxiliaryCommentBefore: string;
	auxiliaryCommentAfter: string;
	comments: boolean;
	shouldPrintComment (value: string): boolean;
}

export interface IGetBabelOptionsOptions extends Partial<IBabelUserConfigurableOptions> {
	filename: string;
	relativeFilename: string;
	typescriptOptions: ParsedCommandLine;
	inputSourceMap?: SourceMap;
	browserslist: Browserslist;
}