import type {TS} from "../../type/ts.js";

/**
 * Gets the NewLineCharacter to use for a NewLineKind
 */
export function getNewLineCharacter(newLine: TS.NewLineKind, typescript: typeof TS): string {
	switch (newLine) {
		case typescript.NewLineKind.CarriageReturnLineFeed:
			return "\r\n";
		case typescript.NewLineKind.LineFeed:
			return "\n";
	}
}
