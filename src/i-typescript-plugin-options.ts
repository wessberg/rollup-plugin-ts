import {Browserslist} from "./browserslist";
import {IBabelUserConfigurableOptions} from "./i-get-babel-options-options";

export interface ITypescriptPluginOptions {
	root: string;
	tsconfig: string;
	include: string|string[];
	exclude: string|string[];
	parseExternalModules: boolean;
	browserslist: Browserslist;
	babel: Partial<IBabelUserConfigurableOptions>;
}