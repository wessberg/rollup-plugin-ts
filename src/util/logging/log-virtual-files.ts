import chalk from "chalk";
import {getFormattedDateTimePrefix} from "./get-formatted-date-time-prefix";
import {inspect} from "../inspect/inspect";

export function logVirtualFiles(files: string[]): void {
	console.log(`${getFormattedDateTimePrefix()}${chalk.gray(`Virtual Files`)}`);
	inspect(files);
}
