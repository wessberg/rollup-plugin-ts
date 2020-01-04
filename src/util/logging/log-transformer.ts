import {TS} from "../../type/ts";
import chalk from "chalk";
import {getFormattedDateTimePrefix} from "./get-formatted-date-time-prefix";

export interface LogTransformationResult {
	finish(sourceFile: TS.SourceFile): void;
}

function logTransformationStep(leadingText: string, name: string, sourceFile: TS.SourceFile, printer: TS.Printer): void {
	console.log(`${getFormattedDateTimePrefix()}${chalk.magenta(`transformer: ${leadingText} ${name}`)} ${chalk.gray(`(${sourceFile.fileName})`)}`);
	console.log(chalk.white(printer.printFile(sourceFile)));
}

export function logTransformer(name: string, sourceFile: TS.SourceFile, printer: TS.Printer): LogTransformationResult {
	logTransformationStep("Before", name, sourceFile, printer);
	return {
		finish: nextSourceFile => logTransformationStep("After", name, nextSourceFile, printer)
	};
}
