import {EmitPathKind, TypescriptPluginOptions} from "../../plugin/typescript-plugin-options.js";
import {TS} from "../../type/ts.js";

export function shouldDebugSourceFile(debug: TypescriptPluginOptions["debug"], {fileName, text}: TS.SourceFile): boolean {
	if (typeof debug === "boolean") return debug;
	return Boolean(
		debug({
			kind: "transformer",
			fileName,
			text
		})
	);
}

export function shouldDebugMetrics(debug: TypescriptPluginOptions["debug"], sourceFile?: TS.SourceFile): boolean {
	if (typeof debug === "boolean") return debug;
	return Boolean(
		debug({
			kind: "metrics",
			...(sourceFile == null ? {} : {fileName: sourceFile.fileName})
		})
	);
}

export function shouldDebugEmit(debug: TypescriptPluginOptions["debug"], fileName: string, text: string, outputPathKind: EmitPathKind): boolean {
	if (typeof debug === "boolean") return debug;
	return Boolean(
		debug({
			kind: "emit",
			fileKind: outputPathKind,
			fileName,
			text
		})
	);
}

export function shouldDebugTsconfig(debug: TypescriptPluginOptions["debug"]): boolean {
	if (typeof debug === "boolean") return debug;
	return Boolean(
		debug({
			kind: "tsconfig"
		})
	);
}

export function shouldDebugVirtualFiles(debug: TypescriptPluginOptions["debug"] | undefined): boolean {
	return debug != null && debug !== false;
}
