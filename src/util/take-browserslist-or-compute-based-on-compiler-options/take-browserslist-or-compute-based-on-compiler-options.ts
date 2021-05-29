import {browsersWithSupportForEcmaVersion} from "browserslist-generator";
import {getEcmaVersionForScriptTarget} from "../get-script-target-from-browserslist/get-script-target-from-browserslist";
import {TS} from "../../type/ts";

/**
 * If a browserslist is given, that one will be used. Otherwise, if the given CompilerOptions has a 'target' property, a Browserslist
 * will be computed based on the targeted Ecma version
 */
export function takeBrowserslistOrComputeBasedOnCompilerOptions(
	browserslist: string[] | undefined | false,
	compilerOptions: TS.CompilerOptions,
	typescript: typeof TS
): string[] | undefined {
	if (browserslist != null && browserslist !== false) {
		// If a browserslist is given, use it
		return browserslist;
	} else if (browserslist === false) {
		return undefined;
	} else {
		// Otherwise, generate a browserslist based on the tsconfig target if given
		return compilerOptions.target == null ? undefined : browsersWithSupportForEcmaVersion(getEcmaVersionForScriptTarget(compilerOptions.target, typescript));
	}
}
