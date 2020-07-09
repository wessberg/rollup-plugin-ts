import {ModuleMergerVisitorOptions, VisitResult} from "../module-merger-visitor-options";
import {TS} from "../../../../../../type/ts";
import {generateModuleSpecifier} from "../../../util/generate-module-specifier";
import {preserveMeta} from "../../../util/clone-node-with-meta";

export function visitImportDeclaration(options: ModuleMergerVisitorOptions<TS.ImportDeclaration>): VisitResult<TS.ImportDeclaration> {
	const {node, compatFactory, typescript} = options;
	const moduleSpecifier = node.moduleSpecifier == null || !typescript.isStringLiteralLike(node.moduleSpecifier) ? undefined : node.moduleSpecifier.text;
	const updatedModuleSpecifier =
		moduleSpecifier == null
			? undefined
			: generateModuleSpecifier({
					...options,
					from: options.sourceFile.fileName,
					moduleSpecifier
			  });

	const matchingSourceFile = moduleSpecifier == null ? undefined : options.getMatchingSourceFile(moduleSpecifier, options.sourceFile);

	const payload = {
		moduleSpecifier,
		matchingSourceFile
	};

	const contResult = options.childContinuation(node, payload);

	if (contResult.importClause == null) {
		// Don't allow moduleSpecifier-only imports inside ambient modules
		return undefined;
	}

	// If the module specifier is to be preserved as it is, just return the continuation result
	if (moduleSpecifier === updatedModuleSpecifier || updatedModuleSpecifier == null) {
		return contResult;
	}

	// Otherwise, update the ModuleSpecifier
	return preserveMeta(
		compatFactory.updateImportDeclaration(
			contResult,
			contResult.decorators,
			contResult.modifiers,
			contResult.importClause,
			compatFactory.createStringLiteral(updatedModuleSpecifier)
		),
		contResult,
		options
	);
}
