import {TSBUILDINFO_EXTENSION} from "../../constant/constant.js";
import {getExtension} from "../path/path-util.js";
import type {TS} from "../../type/ts.js";

/**
 * Returns true if the given OutputFile represents .tsbuildinfo
 */
export function isBuildInfoOutputFile({name}: TS.OutputFile): boolean {
	return getExtension(name) === TSBUILDINFO_EXTENSION;
}
