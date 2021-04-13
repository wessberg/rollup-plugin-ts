import {TS} from "../../../../../../type/ts";
import {InlineNamespaceModuleBlockVisitorOptions} from "../inline-namespace-module-block-visitor-options";
import {preserveParents} from "../../../util/clone-node-with-meta";
import {isNodeFactory} from "../../../util/is-node-factory";
import {generateIdentifierName} from "../../../util/generate-identifier-name";
import {addBindingToLexicalEnvironment} from "../../../util/add-binding-to-lexical-environment";
import {generateUniqueBinding} from "../../../util/generate-unique-binding";
import {isIdentifierFree} from "../../../util/is-identifier-free";
import {getOriginalSourceFile} from "../../../util/get-original-source-file";

export function visitExportDeclaration(options: InlineNamespaceModuleBlockVisitorOptions<TS.ExportDeclaration>): TS.ExportDeclaration|undefined {
	const {node, typescript, compatFactory, host, lexicalEnvironment, sourceFile, intentToAddImportDeclaration} = options;

	if (node.moduleSpecifier == null || !typescript.isStringLiteralLike(node.moduleSpecifier)) {
		return node;
	}

	// Otherwise, we'll have to generate an ImportDeclaration outside the ModuleBlock and reference it here

	if (node.exportClause == null || typescript.isNamespaceExport?.(node.exportClause)) {
		const bindingName = generateIdentifierName(node.moduleSpecifier.text, "namespace");
		addBindingToLexicalEnvironment(lexicalEnvironment, sourceFile.fileName, bindingName);

		const resolveResult = host.resolve(node.moduleSpecifier.text, sourceFile.fileName);
		const resolvedFileName = resolveResult?.resolvedAmbientFileName ?? resolveResult?.resolvedFileName;
		if (resolvedFileName == null) {
			return undefined;
		}
		const resolvedSourceFile = options.host.getSourceFile(resolvedFileName);
		if (resolvedSourceFile == null) {
			return undefined;
		}
		const originalSourceFile = getOriginalSourceFile(node, sourceFile, typescript);

		const exportedBindings = [...(resolvedSourceFile as {symbol?: {exports?: Map<string, unknown>}}).symbol?.exports?.keys() ?? []].map(binding => isIdentifierFree(lexicalEnvironment, binding, originalSourceFile.fileName) ? [binding, binding] : [binding, generateUniqueBinding(lexicalEnvironment, binding)]);

		const namedImports = compatFactory.createNamedImports(exportedBindings.map(([name, deconflictedName]) =>
			compatFactory.createImportSpecifier(
				name === deconflictedName ? undefined : compatFactory.createIdentifier(name),
				compatFactory.createIdentifier(deconflictedName)
			)
		));

		intentToAddImportDeclaration(
			compatFactory.createImportDeclaration(
				undefined,
				undefined,
				isNodeFactory(compatFactory)
					? compatFactory.createImportClause(false, undefined, namedImports)
					: compatFactory.createImportClause(undefined, namedImports, false),
				compatFactory.createStringLiteral(node.moduleSpecifier.text)
			)
		);

		const namedExports = compatFactory.createNamedExports(exportedBindings.map(([name, deconflictedName]) => compatFactory.createExportSpecifier(
			name === deconflictedName ? undefined : compatFactory.createIdentifier(deconflictedName), compatFactory.createIdentifier(name)
		)));

		return preserveParents(
			isNodeFactory(compatFactory)
				? compatFactory.updateExportDeclaration(
				node,
				node.decorators,
				node.modifiers,
				node.isTypeOnly,
				namedExports,
				undefined
				)
				: compatFactory.updateExportDeclaration(
				node,
				node.decorators,
				node.modifiers,
				namedExports,
				undefined,
				node.isTypeOnly
				),
			options
		);
	}

	return node;
}
