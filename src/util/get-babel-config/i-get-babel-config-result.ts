import {IBabelConfig} from "../../plugin/i-babel-options";

export interface IGetBabelConfigResult {
	config: IBabelConfig;
	minifyConfig?: IBabelConfig;
}