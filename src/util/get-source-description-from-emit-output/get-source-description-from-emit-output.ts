import {SourceDescription} from "rollup";
import {SOURCE_MAP_COMMENT} from "../../constant/constant.js";
import {isCodeOutputFile} from "../is-code-output-file/is-code-output-file.js";
import {isMapOutputFile} from "../is-map-output-file/is-map-output-file.js";
import {TS} from "../../type/ts.js";

/**
 * Gets a SourceDescription from the given EmitOutput
 */
export function getSourceDescriptionFromEmitOutput(output: TS.EmitOutput): SourceDescription | undefined {
	const code = output.outputFiles.find(isCodeOutputFile);
	if (code == null) return undefined;

	const map = output.outputFiles.find(isMapOutputFile);

	// Remove the SourceMap comment from the code if it is given. Rollup is the decider of whether or not to emit SourceMaps and if they should be inlined
	const inlinedSourcemapIndex = code.text.indexOf(`\n${SOURCE_MAP_COMMENT}`);

	if (inlinedSourcemapIndex >= 0) {
		code.text = code.text.slice(0, inlinedSourcemapIndex);
	}

	return {
		code: code.text,
		...(map == null ? {} : {map: map.text})
	};
}
