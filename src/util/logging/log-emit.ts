import color from "ansi-colors";
import {getFormattedDateTimePrefix} from "./get-formatted-date-time-prefix.js";

export function logEmit(fileName: string, text: string): void {
	console.log(`${getFormattedDateTimePrefix()}${color.blue(`emit: ${fileName}`)}`);
	console.log(color.white(text));
}
