import type {GetForcedCompilerOptionsOptions} from "./get-forced-compiler-options-options.js";
import {getScriptTargetFromBrowserslist} from "../get-script-target-from-browserslist/get-script-target-from-browserslist.js";
import {getOutDir} from "../get-out-dir/get-out-dir.js";
import type {TS} from "../../type/ts.js";
import {getTranspilerOptions, isUsingTranspiler} from "../plugin-options/get-plugin-options.js";

/**
 * Gets the ModuleKind to force
 */
function getForcedModuleKindOption({pluginOptions}: GetForcedCompilerOptionsOptions): {module: TS.ModuleKind} {
	// Under these circumstances, TypeScript is a client of Rollup, and Rollup only understands ESM.
	// Rollup, not TypeScript, is the decider of which module system(s) to target based on the Rollup configuration.
	// Because of this, TypeScript will always be instructed to emit ESM.
	return {module: pluginOptions.typescript.ModuleKind.ESNext};
}

/**
 * Gets the ScriptTarget to force
 */
function getForcedScriptTargetOption({pluginOptions, browserslist}: GetForcedCompilerOptionsOptions): {target?: TS.ScriptTarget} {
	// If anything else than TypeScript should perform the rest of the transpilation after stripping TypeScript syntax, always target the latest ECMAScript version and let the other transpiler take care of the rest
	if (getTranspilerOptions(pluginOptions.transpiler).otherSyntax !== "typescript") {
		return {target: pluginOptions.typescript.ScriptTarget.ESNext};
	}

	// If a Browserslist is provided, and if Typescript should perform the transpilation, decide the appropriate ECMAScript version based on the Browserslist.
	else if (browserslist != null && browserslist !== false) {
		return {target: getScriptTargetFromBrowserslist(browserslist, pluginOptions.typescript)};
	}

	// Otherwise, don't force the 'target' option
	return {};
}

/**
 * Decide whether or not to force import helpers
 */
function getForcedImportHelpersOption({pluginOptions}: GetForcedCompilerOptionsOptions): {importHelpers?: boolean} {
	// If TypeScript is being used, which uses tslib, helpers should *always* be imported.
	// We don't want them to be duplicated multiple times within generated chunks.
	// When other transpilers are being used in some shape of form, they'll have similar enforced options
	if (isUsingTranspiler("typescript", getTranspilerOptions(pluginOptions.transpiler))) {
		return {importHelpers: true};
	}

	// Otherwise, don't force the 'importHelpers' option
	return {};
}

/**
 * Retrieves the CompilerOptions that will be forced
 */
export function getForcedCompilerOptions(options: GetForcedCompilerOptionsOptions): Partial<TS.CompilerOptions> {
	return {
		...getForcedModuleKindOption(options),
		...getForcedScriptTargetOption(options),
		...getForcedImportHelpersOption(options),
		outDir: getOutDir(options.pluginOptions.cwd),
		// Rollup, not Typescript, is the decider of where to put files
		outFile: undefined,
		// Always generate SourceMaps. Rollup will then decide if it wants to use them or not
		sourceMap: true,
		// Never use inline source maps. Let Rollup inline the returned SourceMap if it can and if sourcemaps should be emitted in the OutputOptions,
		inlineSourceMap: false,
		// Since we never use inline source maps, inline sources aren't supported
		inlineSources: false,
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
		skipLibCheck: true
	};
}
