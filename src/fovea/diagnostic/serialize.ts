import {FoveaDiagnostic} from "./fovea-diagnostic";
import {FoveaHostKind} from "@fovea/common";
import {paintBorder, paintError, paintMetadata, paintNumber, paintSuccess, paintWarning} from "./paint";
import {FoveaDiagnosticDegree} from "./fovea-diagnostic-degree";

/**
 * Finalizes a diagnostic
 * @param {FoveaDiagnostic} diagnostic
 */
export function finalizeDiagnostic<T extends FoveaDiagnostic>  (diagnostic: T): T {
	diagnostic.toString = () => stringifyDiagnostic(diagnostic);
	return diagnostic;
}

/**
 * Finalizes an array of diagnostics
 * @param {FoveaDiagnostic[]} diagnostics
 * @param {string} [file]
 * @returns {FoveaDiagnostic[]}
 */
export function finalizeDiagnostics<T extends FoveaDiagnostic> (diagnostics: T[], file?: string): T[] {
	diagnostics.toString = () => stringifyDiagnostics(diagnostics, file);
	return diagnostics;
}

/**
 * Stringifies a host kind so it is humanly readable
 * @param {FoveaHostKind} hostKind
 * @returns {string}
 */
export function stringifyHostKind (hostKind: FoveaHostKind|string): string {
	return hostKind === FoveaHostKind.CUSTOM_ELEMENT ? "custom element" : hostKind === FoveaHostKind.CUSTOM_ATTRIBUTE ? "custom attribute" : hostKind;
}

/**
 * Stringifies an array of diagnostics
 * @param {FoveaDiagnostic[]} diagnostics
 * @param {string} [file]
 * @returns {string}
 */
function stringifyDiagnostics (diagnostics: FoveaDiagnostic[], file?: string): string {
	// If there are no diagnostics, print a success message to the user.
	if (diagnostics.length < 1) {
		return paintSuccess(
			file == null
				? `Fovea detected no errors or warnings during compilation ✓`
				: `Fovea detected no errors or warnings for the file '${paintMetadata(file)}' during compilation ✓`
		);
	}

	// Otherwise, inform that there were diagnostics and print all of them
	else {
		const errorCount = diagnostics.filter(diagnostic => diagnostic.degree === FoveaDiagnosticDegree.ERROR).length;
		const warningCount = diagnostics.filter(diagnostic => diagnostic.degree === FoveaDiagnosticDegree.WARNING).length;
		return (
			paintError(
				file == null
					? `\nFovea detected ${paintNumber(errorCount)} ${errorCount === 1 ? "error" : "errors"} and ${paintNumber(warningCount)} ${warningCount === 1 ? "warning" : "warnings"} during compilation:`
					: `\nFovea detected ${paintNumber(errorCount)} ${errorCount === 1 ? "error" : "errors"} and ${paintNumber(warningCount)} ${warningCount === 1 ? "warning" : "warnings"} for the file '${paintMetadata(file)}' during compilation:`
			) + "\n\n" +
			diagnostics.map(diagnostic => diagnostic.toString()).join("")
		);
	}
}

/**
 * Stringifies a FoveaDiagnostic
 * @param {FoveaDiagnostic} diagnostic
 * @returns {string}
 */
function stringifyDiagnostic (diagnostic: FoveaDiagnostic): string {
	const borderWidth = 20;
	return (
		(diagnostic.degree === FoveaDiagnosticDegree.ERROR ? paintError("Error:") : paintWarning("Warning:")) + "\n" + diagnostic.description + "\n" +
		formatTableRows([
			["File", paintMetadata(diagnostic.file)],
			["Code", paintMetadata(diagnostic.kind)]
		]) +
		paintBorder("-".repeat(borderWidth)) + "\n");
}

/**
 * Formats the given key-value pairs as table rows with identical indentation
 * @param {[string, string][]} pairs
 * @returns {string}
 */
function formatTableRows (pairs: [string, string][]): string {
	const padSize = 6;
	const padWith = " ";
	let str = "";
	pairs.forEach(([key, value]) => str += `${key}:`.padEnd(padSize, padWith) + value + "\n");
	return str;
}