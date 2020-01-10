import {IBabelInputOptions} from "./i-babel-options";
import {CustomTransformersFunction} from "../util/merge-transformers/i-custom-transformer-options";
import {FileSystem} from "../util/file-system/file-system";
import {TS} from "../type/ts";

export type Transpiler = "typescript" | "babel";

export interface DebugTransformerData {
	kind: "transformer";
	fileName: string;
	text: string;
}

export interface DebugEmitData {
	kind: "emit";
	fileName: string;
	text: string;
	fileKind: EmitPathKind;
}

export interface DebugMetricsData {
	kind: "metrics";
	fileName?: string;
}

export type DebugData = DebugTransformerData | DebugEmitData | DebugMetricsData;

export type DebugOptionCallback = (data: DebugData) => boolean;

export interface IBrowserslistPathConfig {
	path: string;
}

export interface IBrowserslistQueryConfig {
	query: string[] | string;
}

export type BrowserslistConfig = IBrowserslistPathConfig | IBrowserslistQueryConfig;

export interface TsConfigResolverWithFileName {
	fileName: string;
	hook(resolvedOptions: TS.CompilerOptions): TS.CompilerOptions;
}

export type TsConfigResolver = TsConfigResolverWithFileName["hook"];

export type OutputPathKind = "declaration" | "declarationMap" | "buildInfo";
export type EmitPathKind = OutputPathKind | "javascript";
export type OutputPathHook = (path: string, kind: OutputPathKind) => string | undefined;
export type DiagnosticsHook = (diagnostics: readonly TS.Diagnostic[]) => readonly TS.Diagnostic[] | undefined;

export interface HookRecord {
	outputPath: OutputPathHook;
	diagnostics: DiagnosticsHook;
}

export interface InputCompilerOptions extends Omit<TS.CompilerOptions, "module" | "moduleResolution" | "newLine" | "jsx" | "target"> {
	module: string;
	moduleResolution: string;
	newLine: string;
	jsx: string;
	target: string;
}

export interface ITypescriptPluginBaseOptions {
	transpiler: Transpiler;
	tsconfig?:
		| string
		| Partial<TS.CompilerOptions>
		| Partial<InputCompilerOptions>
		| TS.ParsedCommandLine
		| TsConfigResolver
		| TsConfigResolverWithFileName;
	browserslist?: false | string[] | string | BrowserslistConfig;
	cwd: string;
	transformers?: (TS.CustomTransformers | CustomTransformersFunction)[] | TS.CustomTransformers | CustomTransformersFunction;
	include: string[] | string;
	exclude: string[] | string;
	transpileOnly?: boolean;
	fileSystem: FileSystem;
	hook: Partial<HookRecord>;
	debug: boolean | DebugOptionCallback;
	typescript: typeof TS;
}

export interface ITypescriptPluginTypescriptOptions extends ITypescriptPluginBaseOptions {
	transpiler: "typescript";
}

export interface ITypescriptPluginBabelOptions extends ITypescriptPluginBaseOptions {
	transpiler: "babel";
	babelConfig?: string | Partial<IBabelInputOptions>;
}

export type TypescriptPluginOptions = ITypescriptPluginTypescriptOptions | ITypescriptPluginBabelOptions;
