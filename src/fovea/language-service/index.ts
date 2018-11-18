import * as ts_module from "typescript/lib/tsserverlibrary";
import {existsSync, readFileSync, writeFileSync} from "fs";
import {foveaValidator} from "../walker/validator/validator/fovea-validator";

const logPath = "/Users/Wessberg/Desktop/foo.txt";

/**
 * Logs the given message to disk
 * @param {string} message
 */
// @ts-ignore
function log (message: string): void {
	let text = existsSync(logPath) ? readFileSync(logPath).toString() : "";
	if (!text.endsWith("\n")) text += "\n";
	text += message;
	writeFileSync(logPath, text);
}

export default function init (modules: { typescript: typeof ts_module }) {
	// @ts-ignore
	const ts = modules.typescript;

	function create (info: ts_module.server.PluginCreateInfo) {
		// Set up decorator
		const proxy: ts_module.LanguageService = Object.create(null);
		const oldLanguageService = info.languageService;

		for (const k in oldLanguageService) {
			proxy[<keyof ts.LanguageService> k] = function () {
				return oldLanguageService[<keyof ts.LanguageService> k]!.apply(oldLanguageService, arguments);
			};
		}

		proxy.getSemanticDiagnostics = function (fileName: string) {
			const combinedDiagnostics = [
				...oldLanguageService.getSemanticDiagnostics(fileName)
			];

			const program = oldLanguageService.getProgram()!;
			const validator = foveaValidator({
				program: program!,
				addDiagnostics (...diagnostics): void {
					combinedDiagnostics.push(...diagnostics);
				}
			});

			const sourceFile = program!.getSourceFile(fileName)!;
			validator(sourceFile);
			return combinedDiagnostics;
		};
		return proxy;
	}

	return {create};
}