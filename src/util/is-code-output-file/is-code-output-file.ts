import {D_TS_EXTENSION, D_TS_MAP_EXTENSION, SOURCE_MAP_EXTENSION} from "../../constant/constant";
import {getExtension} from "../path/path-util";
import {TS} from "../../type/ts";

/**
 * Returns true if the given OutputFile represents code
 */
export function isCodeOutputFile({name}: TS.OutputFile): boolean {
	const extension = getExtension(name);
	return [SOURCE_MAP_EXTENSION, D_TS_EXTENSION, D_TS_MAP_EXTENSION].every(otherExtension => extension !== otherExtension);
}
