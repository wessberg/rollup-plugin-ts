import type {TS} from "../../type/ts.js";
import color from "ansi-colors";
import {getFormattedDateTimePrefix} from "./get-formatted-date-time-prefix.js";

export interface LogTransformationResult {
	finish(sourceFile: TS.SourceFile): void;
}

function logTransformationStep(leadingText: string, name: string, sourceFile: TS.SourceFile, printer: TS.Printer): void {
	console.log(`${getFormattedDateTimePrefix()}${color.magenta(`transformer: ${leadingText} ${name}`)} ${color.gray(`(${sourceFile.fileName})`)}`);
	console.log(color.white(printer.printFile(sourceFile)));
}

export function logTransformer(name: string, sourceFile: TS.SourceFile, printer: TS.Printer): LogTransformationResult {
	logTransformationStep("Before", name, sourceFile, printer);
	return {
		finish: nextSourceFile => logTransformationStep("After", name, nextSourceFile, printer)
	};
}
