import MagicString from "magic-string";
import {MagicStringContainer} from "./magic-string-container";
import {RawSourceMap} from "rollup";

/**
 * Gets a MagicStringContainer from the given arguments
 * @param {string} code
 * @param {string} file
 * @return {MagicStringContainer}
 */
export function getMagicStringContainer(code: string, file: string): MagicStringContainer {
	const magicString = new MagicString(code);
	let hasModified = false;

	return {
		get map() {
			return magicString.generateMap({hires: true, includeContent: true, source: code, file}) as RawSourceMap;
		},
		get code() {
			return magicString.toString();
		},
		replaceAll(content: string, replacement: string): void {
			hasModified = true;
			let offset = 0;
			while (true) {
				const startIndex = code.indexOf(content, offset);
				if (startIndex < 0) break;
				const endIndex = startIndex + content.length;
				if (endIndex > code.length) break;
				magicString.overwrite(startIndex, endIndex, replacement);
				offset = endIndex;
			}
		},
		get hasModified() {
			return hasModified;
		}
	};
}
