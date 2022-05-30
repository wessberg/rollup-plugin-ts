import {JS_EXTENSION, JSON_EXTENSION, JSX_EXTENSION, TS_EXTENSION, TSX_EXTENSION} from "../../constant/constant.js";
import {TS} from "../../type/ts.js";

/**
 * Gets a ScriptKind from the given path
 */
export function getScriptKindFromPath(path: string, typescript: typeof TS): TS.ScriptKind {
	if (path.endsWith(JS_EXTENSION)) {
		return typescript.ScriptKind.JS;
	} else if (path.endsWith(TS_EXTENSION)) {
		return typescript.ScriptKind.TS;
	} else if (path.endsWith(TSX_EXTENSION)) {
		return typescript.ScriptKind.TSX;
	} else if (path.endsWith(JSX_EXTENSION)) {
		return typescript.ScriptKind.JSX;
	} else if (path.endsWith(JSON_EXTENSION)) {
		return typescript.ScriptKind.JSON;
	} else {
		return typescript.ScriptKind.Unknown;
	}
}
