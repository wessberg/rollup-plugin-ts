import chalk from "chalk";

export interface Benchmark {
	finish(): void;
}
export function benchmark(message: string): Benchmark {
	const currentDate = new Date();
	const currentDateTime = `(${currentDate
		.getHours()
		.toString()
		.padStart(2, "0")}:${currentDate
		.getMinutes()
		.toString()
		.padStart(2, "0")}:${currentDate
		.getSeconds()
		.toString()
		.padStart(2, "0")})`;
	const leadingMessage = `${chalk.gray(currentDateTime)}`;
	const uniqueMessage = `${leadingMessage}${message}`;
	console.time(uniqueMessage);

	return {
		finish: () => console.timeEnd(uniqueMessage)
	};
}
