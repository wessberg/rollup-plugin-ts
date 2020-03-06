import {ModuleFormat} from "rollup";
import {TS} from "../../type/ts";

/**
 * Gets a proper ModuleKind for Typescript based on the format given from the Rollup options
 */
export function getModuleKindFromRollupFormat(format: ModuleFormat, typescript: typeof TS): TS.ModuleKind {
	switch (format) {
		case "amd":
			return typescript.ModuleKind.AMD;
		case "cjs":
		case "commonjs":
			return typescript.ModuleKind.CommonJS;
		case "system":
		case "systemjs":
			return typescript.ModuleKind.System;
		case "es":
		case "esm":
		case "module":
			return typescript.ModuleKind.ESNext;
		case "umd":
			return typescript.ModuleKind.UMD;
		case "iife":
			return typescript.ModuleKind.None;
	}
}
