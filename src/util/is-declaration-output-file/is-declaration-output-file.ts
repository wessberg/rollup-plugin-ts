import {DECLARATION_EXTENSION} from "../../constant/constant";
import {getExtension} from "../path/path-util";
import {TS} from "../../type/ts";

/**
 * Returns true if the given OutputFile represents a declaration file
 */
export function isDeclarationOutputFile({name}: TS.OutputFile): boolean {
	return getExtension(name) === DECLARATION_EXTENSION;
}
