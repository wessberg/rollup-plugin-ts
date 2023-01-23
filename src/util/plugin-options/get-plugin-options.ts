import TSModule from "typescript";
import type {Transpiler, TranspilerOptions, TypescriptPluginOptions} from "../../plugin/typescript-plugin-options.js";
import {ensureAbsolute} from "../path/path-util.js";
import path from "crosspath";

/**
 * Gets normalized PluginOptions based on the given ones
 */
export function getPluginOptions(options: Partial<TypescriptPluginOptions>): TypescriptPluginOptions {
	// Destructure the options and provide default
	const {
		browserslist,
		transpiler = "typescript",
		typescript = TSModule,
		cwd = path.normalize(process.cwd()),
		tsconfig,
		transformers,
		include = [],
		exclude = [],
		transpileOnly = false,
		debug = false,
		fileSystem = typescript.sys,
		babelConfig = {},
		swcConfig = {},
		hook = {}
	} = options;

	return {
		typescript,
		transpiler,
		browserslist,
		cwd: ensureAbsolute(process.cwd(), cwd),
		exclude,
		include,
		transformers,
		tsconfig,
		babelConfig,
		swcConfig,
		transpileOnly,
		debug,
		fileSystem,
		hook
	};
}

export function getTranspilerOptions(transpiler: TypescriptPluginOptions["transpiler"]): TranspilerOptions {
	if (typeof transpiler === "string") {
		return {
			typescriptSyntax: transpiler,
			otherSyntax: transpiler
		};
	}
	return transpiler;
}

export function isUsingTranspiler(transpiler: Transpiler, options: TranspilerOptions): boolean {
	return options.typescriptSyntax === transpiler || options.otherSyntax === transpiler;
}
