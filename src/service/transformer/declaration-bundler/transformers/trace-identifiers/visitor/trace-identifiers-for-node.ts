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
import {TraceIdentifiersVisitorOptions} from "../trace-identifiers-visitor-options";

/**
 * Traces identifiers for the given Node, potentially generating new unique variable names for them
 */
export function traceIdentifiersForNode({node, ...options}: TraceIdentifiersVisitorOptions): void {
	if (options.typescript.isBindingElement(node)) traceIdentifiersForBindingElement({...options, node});
	else if (options.typescript.isClassDeclaration(node)) traceIdentifiersForClassDeclaration({...options, node});
	else if (options.typescript.isEnumDeclaration(node)) traceIdentifiersForEnumDeclaration({...options, node});
	else if (options.typescript.isFunctionDeclaration(node)) traceIdentifiersForFunctionDeclaration({...options, node});
	else if (options.typescript.isImportClause(node)) traceIdentifiersForImportClause({...options, node});
	else if (options.typescript.isNamespaceImport(node)) traceIdentifiersForNamespaceImport({...options, node});
	else if (options.typescript.isImportSpecifier(node)) traceIdentifiersForImportSpecifier({...options, node});
	else if (options.typescript.isExportSpecifier(node)) traceIdentifiersForExportSpecifier({...options, node});
	else if (options.typescript.isIdentifier(node)) traceIdentifiersForIdentifier({...options, node});
	else if (options.typescript.isInterfaceDeclaration(node)) traceIdentifiersForInterfaceDeclaration({...options, node});
	else if (options.typescript.isTypeAliasDeclaration(node)) traceIdentifiersForTypeAliasDeclaration({...options, node});
	else if (options.typescript.isVariableDeclaration(node)) traceIdentifiersForVariableDeclaration({...options, node});
	else options.childContinuation(node);
}
