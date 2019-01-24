import {ScriptKind} from "typescript";
import {JS_EXTENSION, TS_EXTENSION, TSX_EXTENSION, JSX_EXTENSION, JSON_EXTENSION} from "../../constant/constant";

/**
 * Gets a ScriptKind from the given path
 * @param {string} path
 * @returns {ScriptKind}
 */
export function getScriptKindFromPath(path: string): ScriptKind {
	if (path.endsWith(JS_EXTENSION)) {
		return ScriptKind.JS;
	} else if (path.endsWith(TS_EXTENSION)) {
		return ScriptKind.TS;
	} else if (path.endsWith(TSX_EXTENSION)) {
		return ScriptKind.TSX;
	} else if (path.endsWith(JSX_EXTENSION)) {
		return ScriptKind.JSX;
	} else if (path.endsWith(JSON_EXTENSION)) {
		return ScriptKind.JSON;
	} else {
		return ScriptKind.Unknown;
	}
}
