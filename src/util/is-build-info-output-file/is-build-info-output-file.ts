import {TSBUILDINFO_EXTENSION} from "../../constant/constant";
import {getExtension} from "../path/path-util";
import {TS} from "../../type/ts";

/**
 * Returns true if the given OutputFile represents .tsbuildinfo
 */
export function isBuildInfoOutputFile({name}: TS.OutputFile): boolean {
	return getExtension(name) === TSBUILDINFO_EXTENSION;
}
