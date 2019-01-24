import {ModuleFormat} from "rollup";
import {ModuleKind} from "typescript";

/**
 * Gets a proper ModuleKind for Typescript based on the format given from the Rollup options
 * @param {ModuleFormat} format
 * @returns {ModuleKind}
 */
export function getModuleKindFromRollupFormat(format: ModuleFormat): ModuleKind {
	switch (format) {
		case "amd":
			return ModuleKind.AMD;
		case "cjs":
			return ModuleKind.CommonJS;
		case "system":
			return ModuleKind.System;
		case "es":
		case "esm":
			return ModuleKind.ESNext;
		case "umd":
			return ModuleKind.UMD;
		case "iife":
			return ModuleKind.None;
	}
}
