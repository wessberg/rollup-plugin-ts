import {OutputFile} from "typescript";
import {DECLARATION_EXTENSION, DECLARATION_MAP_EXTENSION, SOURCE_MAP_EXTENSION} from "../../constant/constant";
import {getExtension} from "../path/path-util";

/**
 * Returns true if the given OutputFile represents code
 * @param {string} name
 * @returns {boolean}
 */
export function isCodeOutputFile({name}: OutputFile): boolean {
	const extension = getExtension(name);
	return [SOURCE_MAP_EXTENSION, DECLARATION_EXTENSION, DECLARATION_MAP_EXTENSION].every(otherExtension => extension !== otherExtension);
}
