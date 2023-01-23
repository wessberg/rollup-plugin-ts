import type {TS} from "../../../../../../type/ts.js";
import {hasExportModifier} from "../../../util/modifier-util.js";
import {visitClassDeclaration} from "./visit-class-declaration.js";
import {visitClassExpression} from "./visit-class-expression.js";
import {visitFunctionDeclaration} from "./visit-function-declaration.js";
import {visitFunctionExpression} from "./visit-function-expression.js";
import {visitEnumDeclaration} from "./visit-enum-declaration.js";
import {visitInterfaceDeclaration} from "./visit-interface-declaration.js";
import {visitTypeAliasDeclaration} from "./visit-type-alias-declaration.js";
import {visitModuleDeclaration} from "./visit-module-declaration.js";
import {visitExportDeclaration} from "./visit-export-declaration.js";
import {visitExportAssignment} from "./visit-export-assignment.js";
import {visitVariableStatement} from "./visit-variable-statement.js";
import {visitVariableDeclarationList} from "./visit-variable-declaration-list.js";
import {visitVariableDeclaration} from "./visit-variable-declaration.js";
import {visitImportDeclaration} from "./visit-import-declaration.js";
import {visitImportSpecifier} from "./visit-import-specifier.js";
import {visitImportClause} from "./visit-import-clause.js";
import {visitNamedImports} from "./visit-named-imports.js";
import {visitNamespaceImport} from "./visit-namespace-import.js";
import {visitImportEqualsDeclaration} from "./visit-import-equals-declaration.js";
import {visitArrayBindingPattern} from "./visit-array-binding-pattern.js";
import {visitObjectBindingPattern} from "./visit-object-binding-pattern.js";
import {visitBindingElement} from "./visit-binding-element.js";
import {visitIdentifier} from "./visit-identifier.js";
import type {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options.js";

export function visitNode(options: TreeShakerVisitorOptions<TS.Node>): TS.Node | undefined {
	const {node, typescript} = options;
	if (hasExportModifier(node, typescript)) return node;

	if (typescript.isClassDeclaration(node)) {
		return visitClassDeclaration({...options, node});
	} else if (typescript.isClassExpression(node)) {
		return visitClassExpression({...options, node});
	} else if (typescript.isFunctionDeclaration(node)) {
		return visitFunctionDeclaration({...options, node});
	} else if (typescript.isFunctionExpression(node)) {
		return visitFunctionExpression({...options, node});
	} else if (typescript.isEnumDeclaration(node)) {
		return visitEnumDeclaration({...options, node});
	} else if (typescript.isInterfaceDeclaration(node)) {
		return visitInterfaceDeclaration({...options, node});
	} else if (typescript.isTypeAliasDeclaration(node)) {
		return visitTypeAliasDeclaration({...options, node});
	} else if (typescript.isModuleDeclaration(node)) {
		return visitModuleDeclaration({...options, node});
	} else if (typescript.isExportDeclaration(node)) {
		return visitExportDeclaration({...options, node});
	} else if (typescript.isExportAssignment(node)) {
		return visitExportAssignment({...options, node});
	} else if (typescript.isVariableStatement(node)) {
		return visitVariableStatement({...options, node});
	} else if (typescript.isVariableDeclarationList(node)) {
		return visitVariableDeclarationList({...options, node});
	} else if (typescript.isVariableDeclaration(node)) {
		return visitVariableDeclaration({...options, node});
	} else if (typescript.isImportDeclaration(node)) {
		return visitImportDeclaration({...options, node});
	} else if (typescript.isImportSpecifier(node)) {
		return visitImportSpecifier({...options, node});
	} else if (typescript.isImportClause(node)) {
		return visitImportClause({...options, node});
	} else if (typescript.isNamedImports(node)) {
		return visitNamedImports({...options, node});
	} else if (typescript.isNamespaceImport(node)) {
		return visitNamespaceImport({...options, node});
	} else if (typescript.isImportEqualsDeclaration(node)) {
		return visitImportEqualsDeclaration({...options, node});
	} else if (typescript.isArrayBindingPattern(node)) {
		return visitArrayBindingPattern({...options, node});
	} else if (typescript.isObjectBindingPattern(node)) {
		return visitObjectBindingPattern({...options, node});
	} else if (typescript.isBindingElement(node)) {
		return visitBindingElement({...options, node});
	} else if (typescript.isIdentifier(node)) {
		return visitIdentifier({...options, node});
	} else {
		// Fall back to dropping the node
		return undefined;
	}
}
