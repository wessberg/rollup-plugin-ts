import {SourceMap} from "rollup";
import MagicString from "magic-string";
import {BABEL_REQUIRE_RUNTIME_HELPER_ESM_REGEXP_1, BABEL_REQUIRE_RUNTIME_HELPER_ESM_REGEXP_2, BABEL_IMPORT_RUNTIME_HELPER_CJS_REGEXP_1, BABEL_IMPORT_RUNTIME_HELPER_CJS_REGEXP_2, BABEL_IMPORT_RUNTIME_HELPER_CJS_REGEXP_3, BABEL_IMPORT_RUNTIME_HELPER_CJS_REGEXP_4} from "../../constant/constant";
import {matchAll} from "@wessberg/stringutil";

export function replaceBabelHelpers(code: string, filename: string, target: "cjs"|"esm"): {code: string; map: SourceMap} | undefined {
	const matches = target === "cjs" ? [
		...matchAll(code, BABEL_REQUIRE_RUNTIME_HELPER_ESM_REGEXP_1),
		...matchAll(code, BABEL_REQUIRE_RUNTIME_HELPER_ESM_REGEXP_2)
	] : [
		...matchAll(code, BABEL_IMPORT_RUNTIME_HELPER_CJS_REGEXP_1),
		...matchAll(code, BABEL_IMPORT_RUNTIME_HELPER_CJS_REGEXP_2),
		...matchAll(code, BABEL_IMPORT_RUNTIME_HELPER_CJS_REGEXP_3),
		...matchAll(code, BABEL_IMPORT_RUNTIME_HELPER_CJS_REGEXP_4)
	];

	if (matches.length < 1) return undefined;
	const magicString = new MagicString(code, {filename, indentExclusionRanges: []});
	for (const match of matches) {
		const start = match.index + match[1].length;
		const end = match.index + match[1].length + match[2].length;

		if (target === "cjs") {
			magicString.overwrite(start, end, match[2].replace( `/esm/`, `/`));
		} else {
			magicString.overwrite(start, end, match[2].replace( /\/helpers\/(?!esm)/g, `/helpers/esm/`));
		}
		
	}
	return {
		code: magicString.toString(),
		map: magicString.generateMap({hires: true, source: filename, includeContent: true})
	};
}
