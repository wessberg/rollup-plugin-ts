import * as TSModule from "typescript";
import {TypescriptPluginOptions} from "../../plugin/i-typescript-plugin-options";
import {getRealFileSystem} from "../file-system/file-system";

/**
 * Gets normalized PluginOptions based on the given ones
 */
export function getPluginOptions(options: Partial<TypescriptPluginOptions>): TypescriptPluginOptions {
	// Destructure the options and provide defaults
	const {
		browserslist,
		transpiler = "typescript",
		typescript = TSModule,
		cwd = process.cwd(),
		resolveTypescriptLibFrom = cwd,
		tsconfig,
		transformers,
		include = [],
		exclude = [],
		transpileOnly = false,
		debug = false,
		fileSystem = getRealFileSystem(typescript),
		hook = {}
	} = options;

	// These options will be used no matter what
	const baseOptions = {
		typescript,
		browserslist,
		cwd,
		resolveTypescriptLibFrom,
		exclude,
		include,
		transformers,
		tsconfig,
		transpileOnly,
		debug,
		fileSystem,
		hook
	};

	// If we're to use Typescript, return the Typescript-options
	if (transpiler === "typescript") {
		return {
			...baseOptions,
			transpiler: "typescript"
		};
	} else {
		return {
			...baseOptions,
			...("babelConfig" in options ? {babelConfig: options.babelConfig} : {}),
			transpiler: "babel"
		};
	}
}
