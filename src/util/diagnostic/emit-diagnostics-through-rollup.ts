import {IGetDiagnosticsOptions} from "./i-get-diagnostics-options";
import {RollupError, RollupWarning} from "rollup";
import {IExtendedDiagnostic} from "../../diagnostic/i-extended-diagnostic";
import {TS} from "../../type/ts";

/**
 * Gets diagnostics for the given fileName
 */
export function emitDiagnosticsThroughRollup({host, context, pluginOptions}: IGetDiagnosticsOptions): void {
	const typescript = host.getTypescript();
	let diagnostics: readonly TS.Diagnostic[] | undefined = host.getDiagnostics();

	// If there is a hook for diagnostics, call it assign the result of calling it to the local variable 'diagnostics'
	if (pluginOptions.hook.diagnostics != null) {
		diagnostics = pluginOptions.hook.diagnostics(diagnostics);
	}

	// Don't proceed if the hook returned null or undefined
	if (diagnostics == null) return;

	diagnostics.forEach((diagnostic: IExtendedDiagnostic) => {
		const message = typescript.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
		const position =
			diagnostic.start == null || diagnostic.file == null ? undefined : diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);

		// Color-format the diagnostics
		const colorFormatted = typescript.formatDiagnosticsWithColorAndContext([diagnostic], host);

		// Provide a normalized error code
		const code = `${diagnostic.scope == null ? "TS" : diagnostic.scope}${diagnostic.code}`;

		// Provide an empty Stack. There's nothing useful in seeing the internals of this Plugin in the reported error
		const stack = "";

		// Isolate the frame
		const newLine = host.getNewLine();
		let frame = colorFormatted.slice(colorFormatted.indexOf(message) + message.length);

		// Remove the trailing newline from the frame if it has one
		if (frame.startsWith(newLine)) {
			frame = frame.slice(frame.indexOf(newLine) + newLine.length);
		}

		switch (diagnostic.category) {
			case typescript.DiagnosticCategory.Error:
				context.error(
					{
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
					} as RollupError,
					position == null ? undefined : {line: position.line + 1, column: position.character + 1}
				);
				break;

			case typescript.DiagnosticCategory.Warning:
			case typescript.DiagnosticCategory.Message:
			case typescript.DiagnosticCategory.Suggestion:
				context.warn(
					{
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
					} as RollupWarning,
					position == null ? undefined : {line: position.line + 1, column: position.character + 1}
				);
				break;
		}
	});
}
