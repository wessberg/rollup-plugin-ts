import {ModuleMergerVisitorOptions, VisitResult} from "../module-merger-visitor-options";
import {TS} from "../../../../../../../type/ts";

export function visitExportDeclaration({node, ...options}: ModuleMergerVisitorOptions<TS.ExportDeclaration>): VisitResult<TS.ExportDeclaration> {
	const payload = {
		moduleSpecifier:
			node.moduleSpecifier == null || !options.typescript.isStringLiteralLike(node.moduleSpecifier) ? undefined : node.moduleSpecifier.text
	};

	if (payload.moduleSpecifier == null) return options.childContinuation(node, payload);

	const matchingSourceFile = options.getMatchingSourceFile(payload.moduleSpecifier, options.sourceFile.fileName);
	const contResult = options.childContinuation(node, payload);

	// If no SourceFile was resolved, preserve the export as it is.
	if (matchingSourceFile == null) {
		return contResult;
	}

	options.prependNodes(...options.includeSourceFile(matchingSourceFile));

	return options.typescript.updateExportDeclaration(contResult, contResult.decorators, contResult.modifiers, contResult.exportClause, undefined);
}
