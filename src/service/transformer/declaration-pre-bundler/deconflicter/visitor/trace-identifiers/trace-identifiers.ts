import {TraceIdentifiersVisitorOptions} from "../../trace-identifiers-visitor-options";
import {
	isBindingElement,
	isClassDeclaration,
	isEnumDeclaration,
	isExportSpecifier,
	isFunctionDeclaration,
	isIdentifier,
	isImportClause,
	isImportSpecifier,
	isInterfaceDeclaration,
	isNamespaceImport,
	isTypeAliasDeclaration,
	isVariableDeclaration
} from "typescript";
import {traceIdentifiersForBindingElement} from "./trace-identifiers-for-binding-element";
import {traceIdentifiersForClassDeclaration} from "./trace-identifiers-for-class-declaration";
import {traceIdentifiersForEnumDeclaration} from "./trace-identifiers-for-enum-declaration";
import {traceIdentifiersForFunctionDeclaration} from "./trace-identifiers-for-function-declaration";
import {traceIdentifiersForImportClause} from "./trace-identifiers-for-import-clause";
import {traceIdentifiersForNamespaceImport} from "./trace-identifiers-for-namespace-import";
import {traceIdentifiersForImportSpecifier} from "./trace-identifiers-for-import-specifier";
import {traceIdentifiersForExportSpecifier} from "./trace-identifiers-for-export-specifier";
import {traceIdentifiersForIdentifier} from "./trace-identifiers-for-identifier";
import {traceIdentifiersForInterfaceDeclaration} from "./trace-identifiers-for-interface-declaration";
import {traceIdentifiersForTypeAliasDeclaration} from "./trace-identifiers-for-type-alias-declaration";
import {traceIdentifiersForVariableDeclaration} from "./trace-identifiers-for-variable-declaration";

/**
 * Traces identifiers for the given Node, potentially generating new unique variable names for them
 * @param {Node} node
 * @param {TraceIdentifiersVisitorOptions} options
 * @returns {Node | undefined}
 */
export function traceIdentifiers({node, ...rest}: TraceIdentifiersVisitorOptions): void {
	if (isBindingElement(node)) traceIdentifiersForBindingElement({...rest, node});
	else if (isClassDeclaration(node)) traceIdentifiersForClassDeclaration({...rest, node});
	else if (isEnumDeclaration(node)) traceIdentifiersForEnumDeclaration({...rest, node});
	else if (isFunctionDeclaration(node)) traceIdentifiersForFunctionDeclaration({...rest, node});
	else if (isImportClause(node)) traceIdentifiersForImportClause({...rest, node});
	else if (isNamespaceImport(node)) traceIdentifiersForNamespaceImport({...rest, node});
	else if (isImportSpecifier(node)) traceIdentifiersForImportSpecifier({...rest, node});
	else if (isExportSpecifier(node)) traceIdentifiersForExportSpecifier({...rest, node});
	else if (isIdentifier(node)) traceIdentifiersForIdentifier({...rest, node});
	else if (isInterfaceDeclaration(node)) traceIdentifiersForInterfaceDeclaration({...rest, node});
	else if (isTypeAliasDeclaration(node)) traceIdentifiersForTypeAliasDeclaration({...rest, node});
	else if (isVariableDeclaration(node)) traceIdentifiersForVariableDeclaration({...rest, node});
	else rest.childContinuation(node);
}
