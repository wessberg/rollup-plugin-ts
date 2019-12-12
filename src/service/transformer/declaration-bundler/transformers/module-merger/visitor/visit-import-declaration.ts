import {ModuleMergerVisitorOptions, VisitResult} from "../module-merger-visitor-options";
import {TS} from "../../../../../../type/ts";

export function visitImportDeclaration({node, ...options}: ModuleMergerVisitorOptions<TS.ImportDeclaration>): VisitResult<TS.ImportDeclaration> {
	const payload = {
		moduleSpecifier:
			node.moduleSpecifier == null || !options.typescript.isStringLiteralLike(node.moduleSpecifier) ? undefined : node.moduleSpecifier.text
	};

	const contResult = options.childContinuation(node, payload);

	return contResult.importClause == null
		? // Don't allow moduleSpecifier-only imports inside ambient modules
		  undefined
		: contResult;
}
