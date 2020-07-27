import {CustomTransformersFunction} from "../util/merge-transformers/custom-transformer-options";
import {FileSystem} from "../util/file-system/file-system";
import {TS} from "../type/ts";
import {TransformOptions} from "@babel/core";

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

export interface DebugTsconfigData {
	kind: "tsconfig";
}

export type DebugData = DebugTransformerData | DebugEmitData | DebugMetricsData | DebugTsconfigData;

export type DebugOptionCallback = (data: DebugData) => boolean;

export interface BrowserslistPathConfig {
	path: string;
}

export interface BrowserslistQueryConfig {
	query: string[] | string;
}

export type BrowserslistConfig = BrowserslistPathConfig | BrowserslistQueryConfig;

export interface TsConfigResolverWithFileName {
	fileName: string;
	hook(resolvedOptions: TS.CompilerOptions): TS.CompilerOptions;
}

export type TsConfigResolver = TsConfigResolverWithFileName["hook"];

export type OutputPathKind = "declaration" | "declarationMap" | "buildInfo";
export type TranspilationPhase = "file" | "chunk";
export type EmitPathKind = OutputPathKind | "javascript";
export type OutputPathHook = (path: string, kind: OutputPathKind) => string | undefined;
export type DiagnosticsHook = (diagnostics: readonly TS.Diagnostic[]) => readonly TS.Diagnostic[] | undefined;
export type BabelConfigHook = (config: TransformOptions | undefined, fileName: string | undefined, phase: TranspilationPhase) => TransformOptions | undefined;

export interface HookRecord {
	outputPath: OutputPathHook;
	diagnostics: DiagnosticsHook;
	babelConfig: BabelConfigHook;
}

export interface InputCompilerOptions extends Omit<TS.CompilerOptions, "module" | "moduleResolution" | "newLine" | "jsx" | "target"> {
	module: string;
	moduleResolution: string;
	newLine: string;
	jsx: string;
	target: string;
}

export interface TypescriptPluginBaseOptions {
	transpiler: Transpiler;
	tsconfig?: string | Partial<TS.CompilerOptions> | Partial<InputCompilerOptions> | TS.ParsedCommandLine | TsConfigResolver | TsConfigResolverWithFileName;
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

export interface TypescriptPluginTypescriptOptions extends TypescriptPluginBaseOptions {
	transpiler: "typescript";
}

export interface TypescriptPluginBabelOptions extends TypescriptPluginBaseOptions {
	transpiler: "babel";
	babelConfig?: string | Partial<TransformOptions>;
}

export type TypescriptPluginOptions = TypescriptPluginTypescriptOptions | TypescriptPluginBabelOptions;
