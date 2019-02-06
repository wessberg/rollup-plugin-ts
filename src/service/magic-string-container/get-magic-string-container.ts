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
			let copy = code;
			while (true) {
				const startIndex = copy.indexOf(content);
				if (startIndex < 0) break;
				const endIndex = startIndex + content.length;
				copy = copy.replace(content, replacement);
				magicString.overwrite(startIndex, endIndex, replacement);
			}
		},
		get hasModified() {
			return hasModified;
		}
	};
}
