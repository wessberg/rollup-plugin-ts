import {DebugData, OutputPathKind, TypescriptPluginOptions} from "../../plugin/i-typescript-plugin-options";
import {TS} from "../../type/ts";

export function shouldDebug(debug: TypescriptPluginOptions["debug"], data: DebugData): boolean {
	if (typeof debug === "boolean") return debug;
	return Boolean(debug(data));
}

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

export function shouldDebugEmit(debug: TypescriptPluginOptions["debug"], fileName: string, text: string, outputPathKind: OutputPathKind): boolean {
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
