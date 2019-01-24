import {OutputFile} from "typescript";
import {DECLARATION_EXTENSION} from "../../constant/constant";
import {getExtension} from "../path/path-util";

/**
 * Returns true if the given OutputFile represents a declaration file
 * @param {string} name
 * @returns {boolean}
 */
export function isDeclarationOutputFile({name}: OutputFile): boolean {
	return getExtension(name) === DECLARATION_EXTENSION;
}
