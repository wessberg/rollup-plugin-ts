import {ParsedCommandLine, CustomTransformers, CompilerOptions} from "typescript";
import {IBabelInputOptions} from "./i-babel-options";
import {CustomTransformersFunction} from "../util/merge-transformers/i-custom-transformer-options";

export type Transpiler = "typescript" | "babel";

export interface IBrowserslistPathConfig {
	path: string;
}

export interface IBrowserslistQueryConfig {
	query: string[] | string;
}

export type BrowserslistConfig = IBrowserslistPathConfig | IBrowserslistQueryConfig;

export interface ITypescriptPluginBaseOptions {
	transpiler: Transpiler;
	tsconfig?: string | Partial<CompilerOptions> | ParsedCommandLine;
	browserslist?: false | string[] | string | BrowserslistConfig;
	cwd: string;
	transformers?: (CustomTransformers | CustomTransformersFunction)[] | CustomTransformers | CustomTransformersFunction;
	include: string[] | string;
	exclude: string[] | string;
}

export interface ITypescriptPluginTypescriptOptions extends ITypescriptPluginBaseOptions {
	transpiler: "typescript";
}

export interface ITypescriptPluginBabelOptions extends ITypescriptPluginBaseOptions {
	transpiler: "babel";
	babelConfig?: string | Partial<IBabelInputOptions>;
}

export type TypescriptPluginOptions = ITypescriptPluginTypescriptOptions | ITypescriptPluginBabelOptions;
