import {SourceFile, visitNode as visit} from "typescript";
import {IFoveaValidatorOptions} from "./i-fovea-validator-options";
import {ISourceFileValidatorContext} from "./i-source-file-validator-context";
import {visitNode} from "../../visitor/node/visit-node";
import {SourceFileContextKind} from "../../shared/source-file-context-kind";

/**
 * Returns a function that takes a SourceFile and validates it with Fovea
 * @param {ts.Program} program
 * @param {(...diagnostics: FoveaDiagnostic[]) => void} addDiagnostics
 * @returns {(sourceFile: ts.SourceFile) => void}
 */
export function foveaValidator ({program, addDiagnostics}: IFoveaValidatorOptions): (sourceFile: SourceFile) => void {
	return (sourceFile) => {

		// Prepare a context for the SourceFile
		const sourceFileContext: ISourceFileValidatorContext = {
			kind: SourceFileContextKind.VALIDATOR,
			typeChecker: program.getTypeChecker(),
			addDiagnostics
		};

		// Visit the SourceFile and generate a new SourceFile
		visit(sourceFile, node => visitNode(<SourceFile>node, sourceFileContext));
	};
}