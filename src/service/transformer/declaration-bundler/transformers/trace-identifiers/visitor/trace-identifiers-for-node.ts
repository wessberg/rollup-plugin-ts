import {traceIdentifiersForBindingElement} from "./trace-identifiers-for-binding-element.js";
import {traceIdentifiersForClassDeclaration} from "./trace-identifiers-for-class-declaration.js";
import {traceIdentifiersForEnumDeclaration} from "./trace-identifiers-for-enum-declaration.js";
import {traceIdentifiersForFunctionDeclaration} from "./trace-identifiers-for-function-declaration.js";
import {traceIdentifiersForImportClause} from "./trace-identifiers-for-import-clause.js";
import {traceIdentifiersForNamespaceImport} from "./trace-identifiers-for-namespace-import.js";
import {traceIdentifiersForImportSpecifier} from "./trace-identifiers-for-import-specifier.js";
import {traceIdentifiersForExportSpecifier} from "./trace-identifiers-for-export-specifier.js";
import {traceIdentifiersForIdentifier} from "./trace-identifiers-for-identifier.js";
import {traceIdentifiersForInterfaceDeclaration} from "./trace-identifiers-for-interface-declaration.js";
import {traceIdentifiersForTypeAliasDeclaration} from "./trace-identifiers-for-type-alias-declaration.js";
import {traceIdentifiersForVariableDeclaration} from "./trace-identifiers-for-variable-declaration.js";
import type {TraceIdentifiersVisitorOptions} from "../trace-identifiers-visitor-options.js";
import {traceIdentifiersForExportAssignment} from "./trace-identifiers-for-export-assignment.js";
import {traceIdentifiersForCallExpression} from "./trace-identifiers-for-call-expression.js";
import {traceIdentifiersForNewExpression} from "./trace-identifiers-for-new-expression.js";
import {traceIdentifiersForImportEqualsDeclaration} from "./trace-identifiers-for-import-equals-declaration.js";

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
	else if (options.typescript.isImportEqualsDeclaration(node)) traceIdentifiersForImportEqualsDeclaration({...options, node});
	else if (options.typescript.isIdentifier(node)) traceIdentifiersForIdentifier({...options, node});
	else if (options.typescript.isInterfaceDeclaration(node)) traceIdentifiersForInterfaceDeclaration({...options, node});
	else if (options.typescript.isTypeAliasDeclaration(node)) traceIdentifiersForTypeAliasDeclaration({...options, node});
	else if (options.typescript.isVariableDeclaration(node)) traceIdentifiersForVariableDeclaration({...options, node});
	else if (options.typescript.isExportAssignment(node)) traceIdentifiersForExportAssignment({...options, node});
	else if (options.typescript.isCallExpression(node)) traceIdentifiersForCallExpression({...options, node});
	else if (options.typescript.isNewExpression(node)) traceIdentifiersForNewExpression({...options, node});
	else options.childContinuation(node);
}
