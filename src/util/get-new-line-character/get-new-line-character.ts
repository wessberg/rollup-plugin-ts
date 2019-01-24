import {NewLineKind} from "typescript";

/**
 * Gets the NewLineCharacter to use for a NewLineKind
 * @param {NewLineKind} newLine
 * @returns {string}
 */
export function getNewLineCharacter(newLine: NewLineKind): string {
	switch (newLine) {
		case NewLineKind.CarriageReturnLineFeed:
			return "\r\n";
		case NewLineKind.LineFeed:
			return "\n";
	}
}
