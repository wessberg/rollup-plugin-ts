import chalk from "chalk";
import {getFormattedDateTimePrefix} from "./get-formatted-date-time-prefix";
import {TS} from "../../type/ts";
import {inspect} from "../inspect/inspect";

export function logTsconfig(config: TS.ParsedCommandLine): void {
	console.log(`${getFormattedDateTimePrefix()}${chalk.red(`tsconfig`)}`);
	inspect(config);
}
