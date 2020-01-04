import chalk from "chalk";
import {getFormattedDateTimePrefix} from "./get-formatted-date-time-prefix";

export function logEmit(fileName: string, text: string): void {
	console.log(`${getFormattedDateTimePrefix()}${chalk.blue(`emit: ${fileName}`)}`);
	console.log(chalk.white(text));
}
