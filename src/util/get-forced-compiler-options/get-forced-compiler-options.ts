import {CompilerOptions, ModuleKind, ModuleResolutionKind, ScriptTarget} from "typescript";
import {IGetForcedCompilerOptionsOptions} from "./i-get-forced-compiler-options-options";
import {getScriptTargetFromBrowserslist} from "../get-script-target-from-browserslist/get-script-target-from-browserslist";
import {getModuleKindFromRollupFormat} from "../get-module-kind-from-rollup-format/get-module-kind-from-rollup-format";
import {getOutDir} from "../get-out-dir/get-out-dir";

/**
 * Gets the ModuleKind to force
 * @param {IGetForcedCompilerOptionsOptions} options
 * @returns {object}
 */
function getForcedModuleKindOption ({rollupOutputOptions}: IGetForcedCompilerOptionsOptions): { module: ModuleKind } {
	// If no OutputOptions is given, or if no format is given in the OutputOptions, use ESNext. Otherwise, convert the
	// Rollup option into one that Typescript can understand
	if (rollupOutputOptions == null || rollupOutputOptions.format == null) {
		return {module: ModuleKind.ESNext};
	}

	return {module: getModuleKindFromRollupFormat(rollupOutputOptions.format)};
}

/**
 * Gets the ScriptTarget to force
 * @param {IGetForcedCompilerOptionsOptions} options
 * @returns {object}
 */
function getForcedScriptTargetOption ({pluginOptions, browserslist}: IGetForcedCompilerOptionsOptions): { target?: ScriptTarget } {
	// If Babel should perform the transpilation, always target the latest ECMAScript version and let Babel take care of the rest
	if (pluginOptions.transpiler === "babel") {
		return {target: ScriptTarget.ESNext};
	}

	// If a Browserslist is provided, and if Typescript should perform the transpilation, decide the appropriate ECMAScript version based on the Browserslist.
	else if (browserslist != null) {
		return {target: getScriptTargetFromBrowserslist(browserslist)};
	}

	// Otherwise, don't force the 'target' option
	return {};
}

/**
 * Retrieves the CompilerOptions that will be forced
 * @param {IGetForcedCompilerOptionsOptions} options
 * @returns {Partial<CompilerOptions>}
 */
export function getForcedCompilerOptions (options: IGetForcedCompilerOptionsOptions): Partial<CompilerOptions> {

	return {
		...getForcedModuleKindOption(options),
		...getForcedScriptTargetOption(options),
		outDir: getOutDir(options.pluginOptions.cwd, options.rollupOutputOptions),
		baseUrl: ".",
		// Rollup, not Typescript, is the decider of where to put files
		outFile: undefined,
		// Always generate SourceMaps. Rollup will then decide if it wants to use them or not
		sourceMap: true,
		// Never use inline source maps. Let Rollup inline the returned SourceMap if it can and if sourcemaps should be emitted in the OutputOptions,
		inlineSourceMap: false,
		// Since we never use inline source maps, inline sources aren't supported
		inlineSources: false,
		// Helpers should *always* be imported. We don't want them to be duplicated multiple times within generated chunks
		importHelpers: true,
		// Node resolution is required when 'importHelpers' are true
		moduleResolution: ModuleResolutionKind.NodeJs,
		// Typescript should always be able to emit - otherwise we cannot transform source files
		noEmit: false,
		// Typescript should always be able to emit - otherwise we cannot transform source files
		noEmitOnError: false,
		// Typescript should always be able to emit other things than declarations - otherwise we cannot transform source files
		emitDeclarationOnly: false,
		// Typescript should always be able to emit helpers - since we force 'importHelpers'
		noEmitHelpers: false,
		// Typescript should always be able to resolve things - otherwise compilation will break
		noResolve: false,
		// Typescript should never watch files. That is the job of Rollup
		watch: false,
		// Typescript should never watch files. That is the job of Rollup
		preserveWatchOutput: false
	};
}