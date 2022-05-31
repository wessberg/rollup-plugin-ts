import color from "ansi-colors";
import {getFormattedDateTimePrefix} from "./get-formatted-date-time-prefix.js";

export interface LogMetrics {
	finish(): void;
}
export function logMetrics(message: string, fileName?: string): LogMetrics {
	const uniqueMessage = `${getFormattedDateTimePrefix()}${color.green(`metrics: ${message}`)}${fileName == null ? "" : ` ${color.gray(`(${fileName})`)}`}`;
	console.time(uniqueMessage);

	return {
		finish: () => console.timeEnd(uniqueMessage)
	};
}
