import {TS} from "../../../../../../type/ts.js";
import {InlineNamespaceModuleBlockVisitorOptions} from "../inline-namespace-module-block-visitor-options.js";
import {preserveParents} from "../../../util/clone-node-with-meta.js";
import {generateIdentifierName} from "../../../util/generate-identifier-name.js";
import {addBindingToLexicalEnvironment} from "../../../util/add-binding-to-lexical-environment.js";
import {generateUniqueBinding} from "../../../util/generate-unique-binding.js";
import {isIdentifierFree} from "../../../util/is-identifier-free.js";
import {getOriginalSourceFile} from "../../../util/get-original-source-file.js";

export function visitExportDeclaration(options: InlineNamespaceModuleBlockVisitorOptions<TS.ExportDeclaration>): TS.ExportDeclaration | undefined {
	const {node, typescript, factory, host, lexicalEnvironment, sourceFile, intentToAddImportDeclaration} = options;

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

		const exportedBindings = [...((resolvedSourceFile as {symbol?: {exports?: Map<string, unknown>}}).symbol?.exports?.keys() ?? [])].map(binding =>
			binding !== "default" && isIdentifierFree(lexicalEnvironment, binding, originalSourceFile.fileName)
				? [binding, binding]
				: [binding, generateUniqueBinding(lexicalEnvironment, binding === "default" ? "_default" : binding)]
		);

		const namedImports = factory.createNamedImports(
			exportedBindings.map(([name, deconflictedName]) =>
				factory.createImportSpecifier(false, name === deconflictedName ? undefined : factory.createIdentifier(name), factory.createIdentifier(deconflictedName))
			)
		);

		intentToAddImportDeclaration(
			factory.createImportDeclaration(undefined, factory.createImportClause(false, undefined, namedImports), factory.createStringLiteral(node.moduleSpecifier.text))
		);

		const namedExports = factory.createNamedExports(
			exportedBindings.map(([name, deconflictedName]) =>
				factory.createExportSpecifier(false, name === deconflictedName ? undefined : factory.createIdentifier(deconflictedName), factory.createIdentifier(name))
			)
		);

		return preserveParents(factory.updateExportDeclaration(node, node.modifiers, node.isTypeOnly, namedExports, undefined, node.assertClause), options);
	}

	return node;
}
