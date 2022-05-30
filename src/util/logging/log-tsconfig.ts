import chalk from "chalk";
import {getFormattedDateTimePrefix} from "./get-formatted-date-time-prefix.js";
import {TS} from "../../type/ts.js";
import {inspect} from "../inspect/inspect.js";

export function logTsconfig(config: TS.ParsedCommandLine): void {
	console.log(`${getFormattedDateTimePrefix()}${chalk.red(`tsconfig`)}`);
	inspect(config);
}
