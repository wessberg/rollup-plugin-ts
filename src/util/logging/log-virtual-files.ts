import color from "ansi-colors";
import {getFormattedDateTimePrefix} from "./get-formatted-date-time-prefix.js";
import {inspect} from "../inspect/inspect.js";

export function logVirtualFiles(files: string[]): void {
	console.log(`${getFormattedDateTimePrefix()}${color.gray(`Virtual Files`)}`);
	inspect(files);
}
