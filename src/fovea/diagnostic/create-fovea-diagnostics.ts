import {FoveaDiagnostic} from "./fovea-diagnostic";
import {finalizeDiagnostics} from "./serialize";

/**
 * Creates an empty array of Fovea Diagnostics
 * @param {string} fileName
 * @returns {FoveaDiagnostic[]}
 */
export function createFoveaDiagnostics (fileName?: string): FoveaDiagnostic[] {
	return finalizeDiagnostics([], fileName);
}