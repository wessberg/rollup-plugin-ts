import {EmitOutput} from "typescript";
import {IGetDeclarationsFromEmitOutputResult} from "./i-get-declarations-from-emit-output-result";
import {isDeclarationOutputFile} from "../is-declaration-output-file/is-declaration-output-file";
import {isDeclarationMapOutputFile} from "../is-declaration-map-output-file/is-declaration-map-output-file";

/**
 * Gets all declarations from some EmitOutput
 * @param {EmitOutput} output
 * @returns {IGetDeclarationsFromEmitOutputResult}
 */
export function getDeclarationsFromEmitOutput(output: EmitOutput): IGetDeclarationsFromEmitOutputResult {
	return {
		code: output.outputFiles.filter(isDeclarationOutputFile),
		maps: output.outputFiles.filter(isDeclarationMapOutputFile)
	};
}
