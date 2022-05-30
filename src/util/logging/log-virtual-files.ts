import chalk from "chalk";
import {getFormattedDateTimePrefix} from "./get-formatted-date-time-prefix.js";
import {inspect} from "../inspect/inspect.js";

export function logVirtualFiles(files: string[]): void {
	console.log(`${getFormattedDateTimePrefix()}${chalk.gray(`Virtual Files`)}`);
	inspect(files);
}
