import {CompilerOptions, CustomTransformers, ParsedCommandLine, Diagnostic} from "typescript";
import {IBabelInputOptions} from "./i-babel-options";
import {CustomTransformersFunction} from "../util/merge-transformers/i-custom-transformer-options";
import {FileSystem} from "../util/file-system/file-system";

export type Transpiler = "typescript" | "babel";

export interface IBrowserslistPathConfig {
	path: string;
}

export interface IBrowserslistQueryConfig {
	query: string[] | string;
}

export type BrowserslistConfig = IBrowserslistPathConfig | IBrowserslistQueryConfig;

export interface TsConfigResolverWithFileName {
	fileName: string;
	hook(resolvedOptions: CompilerOptions): CompilerOptions;
}

export type TsConfigResolver = TsConfigResolverWithFileName["hook"];

export type OutputPathKind = "declaration" | "declarationMap";
export type OutputPathHook = (path: string, kind: OutputPathKind) => string | undefined;
export type DiagnosticsHook = (diagnostics: readonly Diagnostic[]) => readonly Diagnostic[] | undefined;

export interface HookRecord {
	outputPath: OutputPathHook;
	diagnostics: DiagnosticsHook;
}

export interface InputCompilerOptions extends Omit<CompilerOptions, "module" | "moduleResolution" | "newLine" | "jsx" | "target"> {
	module: string;
	moduleResolution: string;
	newLine: string;
	jsx: string;
	target: string;
}

export interface ITypescriptPluginBaseOptions {
	transpiler: Transpiler;
	tsconfig?: string | Partial<CompilerOptions> | Partial<InputCompilerOptions> | ParsedCommandLine | TsConfigResolver | TsConfigResolverWithFileName;
	browserslist?: false | string[] | string | BrowserslistConfig;
	cwd: string;
	resolveTypescriptLibFrom: string;
	transformers?: (CustomTransformers | CustomTransformersFunction)[] | CustomTransformers | CustomTransformersFunction;
	include: string[] | string;
	exclude: string[] | string;
	transpileOnly?: boolean;
	fileSystem: FileSystem;
	hook: Partial<HookRecord>;
	debug: boolean;
}

export interface ITypescriptPluginTypescriptOptions extends ITypescriptPluginBaseOptions {
	transpiler: "typescript";
}

export interface ITypescriptPluginBabelOptions extends ITypescriptPluginBaseOptions {
	transpiler: "babel";
	babelConfig?: string | Partial<IBabelInputOptions>;
}

export type TypescriptPluginOptions = ITypescriptPluginTypescriptOptions | ITypescriptPluginBabelOptions;
