import chalk from "chalk";

export function getFormattedDateTimePrefix(): string {
	const currentDate = new Date();
	const currentDateTime = `(${currentDate.getHours().toString().padStart(2, "0")}:${currentDate
		.getMinutes()
		.toString()
		.padStart(2, "0")}:${currentDate.getSeconds().toString().padStart(2, "0")})`;
	return `${chalk.gray(currentDateTime)}   `;
}
