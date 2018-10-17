import {OutputFile} from "typescript";
import {DECLARATION_MAP_EXTENSION} from "../../constant/constant";
import {getExtension} from "../path/path-util";

/**
 * Returns true if the given OutputFile represents a map for a declaration file
 * @param {string} name
 * @returns {boolean}
 */
export function isDeclarationMapOutputFile ({name}: OutputFile): boolean {
	return getExtension(name) === DECLARATION_MAP_EXTENSION;
}