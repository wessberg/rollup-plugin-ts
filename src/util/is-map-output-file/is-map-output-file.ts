import {DECLARATION_MAP_EXTENSION, SOURCE_MAP_EXTENSION} from "../../constant/constant";
import {getExtension} from "../path/path-util";
import {TS} from "../../type/ts";

/**
 * Returns true if the given OutputFile represents some code
 */
export function isMapOutputFile({name}: TS.OutputFile): boolean {
	const extension = getExtension(name);
	return [SOURCE_MAP_EXTENSION, DECLARATION_MAP_EXTENSION].some(otherExtension => extension === otherExtension);
}
