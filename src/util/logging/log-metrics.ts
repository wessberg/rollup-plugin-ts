import chalk from "chalk";
import {getFormattedDateTimePrefix} from "./get-formatted-date-time-prefix";

export interface LogMetrics {
	finish(): void;
}
export function logMetrics(message: string, fileName?: string): LogMetrics {
	const uniqueMessage = `${getFormattedDateTimePrefix()}${chalk.green(`metrics: ${message}`)}${fileName == null ? "" : ` ${chalk.gray(`(${fileName})`)}`}`;
	console.time(uniqueMessage);

	return {
		finish: () => console.timeEnd(uniqueMessage)
	};
}
