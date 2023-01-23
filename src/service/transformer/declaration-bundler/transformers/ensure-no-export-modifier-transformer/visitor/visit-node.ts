import type {TS} from "../../../../../../type/ts.js";
import type {EnsureNoExportModifierTransformerVisitorOptions} from "../ensure-no-export-modifier-transformer-visitor-options.js";
import {visitClassDeclaration} from "./visit-class-declaration.js";
import {visitClassExpression} from "./visit-class-expression.js";
import {visitFunctionDeclaration} from "./visit-function-declaration.js";
import {visitFunctionExpression} from "./visit-function-expression.js";
import {visitEnumDeclaration} from "./visit-enum-declaration.js";
import {visitVariableStatement} from "./visit-variable-statement.js";
import {visitInterfaceDeclaration} from "./visit-interface-declaration.js";
import {visitModuleDeclaration} from "./visit-module-declaration.js";
import {visitTypeAliasDeclaration} from "./visit-type-alias-declaration.js";

export function visitNode({node, ...options}: EnsureNoExportModifierTransformerVisitorOptions<TS.Node>): TS.Node {
	if (options.typescript.isClassDeclaration(node)) {
		return visitClassDeclaration({...options, node});
	} else if (options.typescript.isClassExpression(node)) {
		return visitClassExpression({...options, node});
	} else if (options.typescript.isFunctionDeclaration(node)) {
		return visitFunctionDeclaration({...options, node});
	} else if (options.typescript.isFunctionExpression(node)) {
		return visitFunctionExpression({...options, node});
	} else if (options.typescript.isEnumDeclaration(node)) {
		return visitEnumDeclaration({...options, node});
	} else if (options.typescript.isInterfaceDeclaration(node)) {
		return visitInterfaceDeclaration({...options, node});
	} else if (options.typescript.isTypeAliasDeclaration(node)) {
		return visitTypeAliasDeclaration({...options, node});
	} else if (options.typescript.isModuleDeclaration(node)) {
		return visitModuleDeclaration({...options, node});
	} else if (options.typescript.isVariableStatement(node)) {
		return visitVariableStatement({...options, node});
	} else {
		// Only consider root-level statements here
		return node;
	}
}
