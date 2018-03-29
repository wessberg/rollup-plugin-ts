import {FormatDiagnosticsHost, NewLineKind} from "typescript";
import {ITypescriptLanguageServiceHost} from "./i-typescript-language-service-host";
import {ensureRelative} from "./helpers";

/**
 * This host will help with formatting diagnostics
 */
export class FormatHost implements FormatDiagnosticsHost {

	constructor (private readonly host: ITypescriptLanguageServiceHost,
							 private readonly appRoot: string) {}

	/**
	 * Returns the current directory
	 * @returns {string}
	 */
	public getCurrentDirectory (): string {
		return this.host.getCurrentDirectory();
	}

	/**
	 * Gets the canonical filename
	 * @param {string} fileName
	 * @returns {string}
	 */
	public getCanonicalFileName (fileName: string): string {
		return ensureRelative(this.appRoot, fileName);
	}

	/**
	 * Gets the NewLine to use
	 * @returns {string}
	 */
	public getNewLine (): string {
		switch (this.host.getTypescriptOptions().options.newLine) {
			case NewLineKind.CarriageReturnLineFeed:
				return "\r\n";
			case NewLineKind.LineFeed:
			default:
				return "\n";
		}
	}
}