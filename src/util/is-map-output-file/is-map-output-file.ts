import {D_TS_MAP_EXTENSION, SOURCE_MAP_EXTENSION} from "../../constant/constant.js";
import {getExtension} from "../path/path-util.js";
import type {TS} from "../../type/ts.js";

/**
 * Returns true if the given OutputFile represents a SourceMap
 */
export function isMapOutputFile({name}: TS.OutputFile): boolean {
	const extension = getExtension(name);
	return [SOURCE_MAP_EXTENSION, D_TS_MAP_EXTENSION].some(otherExtension => extension === otherExtension);
}
