import {SourceMap} from "rollup";
import MagicString from "magic-string";
import {BABEL_REQUIRE_RUNTIME_HELPER_REGEXP_1, BABEL_REQUIRE_RUNTIME_HELPER_REGEXP_2} from "../../constant/constant";
import {matchAll} from "@wessberg/stringutil";

export function replaceBabelEsmHelpers(code: string, filename: string): {code: string; map: SourceMap} | undefined {
	const matches = [...matchAll(code, BABEL_REQUIRE_RUNTIME_HELPER_REGEXP_1), ...matchAll(code, BABEL_REQUIRE_RUNTIME_HELPER_REGEXP_2)];
	if (matches.length < 1) return undefined;
	const magicString = new MagicString(code, {filename, indentExclusionRanges: []});
	for (const match of matches) {
		const start = match.index + match[1].length;
		const end = match.index + match[1].length + match[2].length;
		magicString.overwrite(start, end, match[2].replace(`/esm/`, `/`));
	}
	return {
		code: magicString.toString(),
		map: magicString.generateMap({hires: true, source: filename, includeContent: true})
	};
}
