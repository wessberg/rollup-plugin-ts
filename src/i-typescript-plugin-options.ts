import {Browserslist} from "./browserslist";

export interface ITypescriptPluginOptions {
	root: string;
	tsconfig: string;
	include: string|string[];
	exclude: string|string[];
	parseExternalModules: boolean;
	browserslist: Browserslist;
	additionalBabelPresets: {}[];
	additionalBabelPlugins: {}[];
}