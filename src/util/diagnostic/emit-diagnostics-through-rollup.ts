import {IGetDiagnosticsOptions} from "./i-get-diagnostics-options";
import {DiagnosticCategory, flattenDiagnosticMessageText, formatDiagnosticsWithColorAndContext, getPreEmitDiagnostics} from "typescript";
import {RollupError, RollupWarning} from "rollup";
import {IExtendedDiagnostic} from "../../diagnostic/i-extended-diagnostic";

/**
 * Gets diagnostics for the given fileName
 * @param {IGetDiagnosticsOptions} options
 */
export function emitDiagnosticsThroughRollup({languageService, languageServiceHost, context}: IGetDiagnosticsOptions): void {
	const program = languageService.getProgram();
	if (program == null) return;

	[...getPreEmitDiagnostics(program), ...languageServiceHost.getTransformerDiagnostics()].forEach((diagnostic: IExtendedDiagnostic) => {
		const message = flattenDiagnosticMessageText(diagnostic.messageText, "\n");
		const position =
			diagnostic.start == null || diagnostic.file == null ? undefined : diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);

		// Color-format the diagnostics
		const colorFormatted = formatDiagnosticsWithColorAndContext([diagnostic], languageServiceHost);

		// Provide a normalized error code
		const code = `${diagnostic.scope == null ? "TS" : diagnostic.scope}${diagnostic.code}`;

		// Provide an empty Stack. There's nothing useful in seeing the internals of this Plugin in the reported error
		const stack = "";

		// Isolate the frame
		const newLine = languageServiceHost.getNewLine();
		let frame = colorFormatted.slice(colorFormatted.indexOf(message) + message.length);

		// Remove the trailing newline from the frame if it has one
		if (frame.startsWith(newLine)) {
			frame = frame.slice(frame.indexOf(newLine) + newLine.length);
		}

		switch (diagnostic.category) {
			case DiagnosticCategory.Error:
				context.error(
					<RollupError>{
						frame,
						code,
						name: code,
						stack,
						...(diagnostic.length == null ? {} : {length: diagnostic.length}),
						...(diagnostic.file == null && position == null
							? {}
							: {
									loc: {
										...(diagnostic.file == null ? {} : {file: diagnostic.file.fileName}),
										...(position == null ? {} : {line: position.line + 1}),
										...(position == null ? {} : {column: position.character + 1})
									}
							  }),
						...(diagnostic.file == null ? {} : {pos: diagnostic.file.pos}),
						message
					},
					position == null ? undefined : {line: position.line + 1, column: position.character + 1}
				);
				break;

			case DiagnosticCategory.Warning:
			case DiagnosticCategory.Message:
			case DiagnosticCategory.Suggestion:
				context.warn(
					<RollupWarning>{
						frame,
						code,
						name: code,
						...(diagnostic.length == null ? {} : {length: diagnostic.length}),
						loc: {
							...(diagnostic.file == null ? {} : {file: diagnostic.file.fileName}),
							...(position == null ? {} : {line: position.line + 1}),
							...(position == null ? {} : {column: position.character + 1})
						},
						...(diagnostic.file == null ? {} : {pos: diagnostic.file.pos}),
						message
					},
					position == null ? undefined : {line: position.line + 1, column: position.character + 1}
				);
				break;
		}
	});
}
