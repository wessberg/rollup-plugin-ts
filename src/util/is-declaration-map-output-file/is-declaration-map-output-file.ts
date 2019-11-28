import {DECLARATION_MAP_EXTENSION} from "../../constant/constant";
import {getExtension} from "../path/path-util";
import {TS} from "../../type/ts";

/**
 * Returns true if the given OutputFile represents a map for a declaration file
 */
export function isDeclarationMapOutputFile({name}: TS.OutputFile): boolean {
	return getExtension(name) === DECLARATION_MAP_EXTENSION;
}
