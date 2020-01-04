import {IGetForcedCompilerOptionsOptions} from "./i-get-forced-compiler-options-options";
import {getScriptTargetFromBrowserslist} from "../get-script-target-from-browserslist/get-script-target-from-browserslist";
import {getModuleKindFromRollupFormat} from "../get-module-kind-from-rollup-format/get-module-kind-from-rollup-format";
import {getOutDir} from "../get-out-dir/get-out-dir";
import {TS} from "../../type/ts";

/**
 * Gets the ModuleKind to force
 */
function getForcedModuleKindOption({rollupOutputOptions, pluginOptions}: IGetForcedCompilerOptionsOptions): {module: TS.ModuleKind} {
	// If no OutputOptions is given, or if no format is given in the OutputOptions, use ESNext. Otherwise, convert the
	// Rollup option into one that Typescript can understand
	if (rollupOutputOptions == null || rollupOutputOptions.format == null) {
		return {module: pluginOptions.typescript.ModuleKind.ESNext};
	}

	return {module: getModuleKindFromRollupFormat(rollupOutputOptions.format, pluginOptions.typescript)};
}

/**
 * Gets the ScriptTarget to force
 */
function getForcedScriptTargetOption({pluginOptions, browserslist}: IGetForcedCompilerOptionsOptions): {target?: TS.ScriptTarget} {
	// If Babel should perform the transpilation, always target the latest ECMAScript version and let Babel take care of the rest
	if (pluginOptions.transpiler === "babel") {
		return {target: pluginOptions.typescript.ScriptTarget.ESNext};
	}

	// If a Browserslist is provided, and if Typescript should perform the transpilation, decide the appropriate ECMAScript version based on the Browserslist.
	else if (browserslist != null) {
		return {target: getScriptTargetFromBrowserslist(browserslist, pluginOptions.typescript)};
	}

	// Otherwise, don't force the 'target' option
	return {};
}

/**
 * Retrieves the CompilerOptions that will be forced
 */
export function getForcedCompilerOptions(options: IGetForcedCompilerOptionsOptions): Partial<TS.CompilerOptions> {
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
		moduleResolution: options.pluginOptions.typescript.ModuleResolutionKind.NodeJs,
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
		preserveWatchOutput: false,
		skipLibCheck: true,

		// Declarations may be generated, but not as part of the Builder program which is used during the transform, renderChunk, and generateBundle phases, so TypeScript needs to be instructed not to generate them.
		// The raw CompilerOptions will be preserved and used in the last compilation phase to generate declarations if needed.
		declaration: false,
		declarationDir: undefined,
		declarationMap: false
	};
}
