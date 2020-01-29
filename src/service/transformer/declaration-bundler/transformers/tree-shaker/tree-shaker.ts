import {visitImportDeclaration} from "./visitor/visit-import-declaration";
import {visitVariableStatement} from "./visitor/visit-variable-statement";
import {visitVariableDeclarationList} from "./visitor/visit-variable-declaration-list";
import {visitVariableDeclaration} from "./visitor/visit-variable-declaration";
import {visitImportSpecifier} from "./visitor/visit-import-specifier";
import {visitImportClause} from "./visitor/visit-import-clause";
import {visitNamedImports} from "./visitor/visit-named-imports";
import {visitNamespaceImport} from "./visitor/visit-namespace-import";
import {visitClassDeclaration} from "./visitor/visit-class-declaration";
import {visitClassExpression} from "./visitor/visit-class-expression";
import {visitFunctionDeclaration} from "./visitor/visit-function-declaration";
import {visitFunctionExpression} from "./visitor/visit-function-expression";
import {visitEnumDeclaration} from "./visitor/visit-enum-declaration";
import {visitInterfaceDeclaration} from "./visitor/visit-interface-declaration";
import {visitTypeAliasDeclaration} from "./visitor/visit-type-alias-declaration";
import {visitModuleDeclaration} from "./visitor/visit-module-declaration";
import {visitExportDeclaration} from "./visitor/visit-export-declaration";
import {visitArrayBindingPattern} from "./visitor/visit-array-binding-pattern";
import {visitBindingElement} from "./visitor/visit-binding-element";
import {visitObjectBindingPattern} from "./visitor/visit-object-binding-pattern";
import {visitIdentifier} from "./visitor/visit-identifier";
import {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options";
import {TS} from "../../../../../type/ts";
import {isReferenced} from "../reference/is-referenced/is-referenced";
import {hasExportModifier} from "../../util/modifier-util";
import {visitExportAssignment} from "./visitor/visit-export-assignment";
import {shouldDebugMetrics, shouldDebugSourceFile} from "../../../../../util/is-debug/should-debug";
import {logMetrics} from "../../../../../util/logging/log-metrics";
import {logTransformer} from "../../../../../util/logging/log-transformer";
import {preserveMeta} from "../../util/clone-node-with-meta";
import {visitImportEqualsDeclaration} from "./visitor/visit-import-equals-declaration";

export function treeShaker(options: SourceFileBundlerVisitorOptions): TS.SourceFile {
	const {typescript, context, sourceFile, pluginOptions, printer} = options;

	const fullBenchmark = shouldDebugMetrics(pluginOptions.debug, sourceFile) ? logMetrics(`Tree-shaking`, sourceFile.fileName) : undefined;

	const transformationLog = shouldDebugSourceFile(pluginOptions.debug, sourceFile) ? logTransformer("Tree-shaking", sourceFile, printer) : undefined;

	// Prepare some VisitorOptions
	const visitorOptions = {
		...options,
		isReferenced: <U extends TS.Node>(node: U): boolean => isReferenced({...visitorOptions, node}),
		continuation: <U extends TS.Node>(node: U): U | undefined => visitor(node) as U | undefined
	};

	function visitor(node: TS.Node): TS.Node | undefined {
		if (hasExportModifier(node, typescript)) return node;

		if (typescript.isClassDeclaration(node)) {
			return visitClassDeclaration({...visitorOptions, node});
		} else if (typescript.isClassExpression(node)) {
			return visitClassExpression({...visitorOptions, node});
		} else if (typescript.isFunctionDeclaration(node)) {
			return visitFunctionDeclaration({...visitorOptions, node});
		} else if (typescript.isFunctionExpression(node)) {
			return visitFunctionExpression({...visitorOptions, node});
		} else if (typescript.isEnumDeclaration(node)) {
			return visitEnumDeclaration({...visitorOptions, node});
		} else if (typescript.isInterfaceDeclaration(node)) {
			return visitInterfaceDeclaration({...visitorOptions, node});
		} else if (typescript.isTypeAliasDeclaration(node)) {
			return visitTypeAliasDeclaration({...visitorOptions, node});
		} else if (typescript.isModuleDeclaration(node)) {
			return visitModuleDeclaration({...visitorOptions, node});
		} else if (typescript.isExportDeclaration(node)) {
			return visitExportDeclaration({...visitorOptions, node});
		} else if (typescript.isExportAssignment(node)) {
			return visitExportAssignment({...visitorOptions, node});
		} else if (typescript.isVariableStatement(node)) {
			return visitVariableStatement({node, ...visitorOptions});
		} else if (typescript.isVariableDeclarationList(node)) {
			return visitVariableDeclarationList({node, ...visitorOptions});
		} else if (typescript.isVariableDeclaration(node)) {
			return visitVariableDeclaration({node, ...visitorOptions});
		} else if (typescript.isImportDeclaration(node)) {
			return visitImportDeclaration({node, ...visitorOptions});
		} else if (typescript.isImportSpecifier(node)) {
			return visitImportSpecifier({node, ...visitorOptions});
		} else if (typescript.isImportClause(node)) {
			return visitImportClause({node, ...visitorOptions});
		} else if (typescript.isNamedImports(node)) {
			return visitNamedImports({node, ...visitorOptions});
		} else if (typescript.isNamespaceImport(node)) {
			return visitNamespaceImport({node, ...visitorOptions});
		} else if (typescript.isImportEqualsDeclaration(node)) {
			return visitImportEqualsDeclaration({node, ...visitorOptions});
		} else if (typescript.isArrayBindingPattern(node)) {
			return visitArrayBindingPattern({node, ...visitorOptions});
		} else if (typescript.isObjectBindingPattern(node)) {
			return visitObjectBindingPattern({node, ...visitorOptions});
		} else if (typescript.isBindingElement(node)) {
			return visitBindingElement({node, ...visitorOptions});
		} else if (typescript.isIdentifier(node)) {
			return visitIdentifier({node, ...visitorOptions});
		} else {
			// Fall back to dropping the node
			return undefined;
		}
	}

	const updatedSourceFile = preserveMeta(typescript.visitEachChild(sourceFile, visitor, context), sourceFile, options);

	transformationLog?.finish(updatedSourceFile);
	fullBenchmark?.finish();

	return updatedSourceFile;
}
