import {TS} from "../../../../../../type/ts";
import {hasExportModifier} from "../../../util/modifier-util";
import {visitClassDeclaration} from "./visit-class-declaration";
import {visitClassExpression} from "./visit-class-expression";
import {visitFunctionDeclaration} from "./visit-function-declaration";
import {visitFunctionExpression} from "./visit-function-expression";
import {visitEnumDeclaration} from "./visit-enum-declaration";
import {visitInterfaceDeclaration} from "./visit-interface-declaration";
import {visitTypeAliasDeclaration} from "./visit-type-alias-declaration";
import {visitModuleDeclaration} from "./visit-module-declaration";
import {visitExportDeclaration} from "./visit-export-declaration";
import {visitExportAssignment} from "./visit-export-assignment";
import {visitVariableStatement} from "./visit-variable-statement";
import {visitVariableDeclarationList} from "./visit-variable-declaration-list";
import {visitVariableDeclaration} from "./visit-variable-declaration";
import {visitImportDeclaration} from "./visit-import-declaration";
import {visitImportSpecifier} from "./visit-import-specifier";
import {visitImportClause} from "./visit-import-clause";
import {visitNamedImports} from "./visit-named-imports";
import {visitNamespaceImport} from "./visit-namespace-import";
import {visitImportEqualsDeclaration} from "./visit-import-equals-declaration";
import {visitArrayBindingPattern} from "./visit-array-binding-pattern";
import {visitObjectBindingPattern} from "./visit-object-binding-pattern";
import {visitBindingElement} from "./visit-binding-element";
import {visitIdentifier} from "./visit-identifier";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

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
