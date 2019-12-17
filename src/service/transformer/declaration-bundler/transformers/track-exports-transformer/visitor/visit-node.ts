import {TS} from "../../../../../../type/ts";
import {TrackExportsTransformerVisitorOptions} from "../track-exports-transformer-visitor-options";
import {visitClassDeclaration} from "./visit-class-declaration";
import {visitClassExpression} from "./visit-class-expression";
import {visitFunctionDeclaration} from "./visit-function-declaration";
import {visitFunctionExpression} from "./visit-function-expression";
import {visitEnumDeclaration} from "./visit-enum-declaration";
import {visitVariableStatement} from "./visit-variable-statement";
import {visitInterfaceDeclaration} from "./visit-interface-declaration";
import {visitModuleDeclaration} from "./visit-module-declaration";
import {visitTypeAliasDeclaration} from "./visit-type-alias-declaration";
import {visitExportDeclaration} from "./visit-export-declaration";
import {visitExportAssignment} from "./visit-export-assignment";

export function visitNode({node, ...options}: TrackExportsTransformerVisitorOptions<TS.Node>): void {
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
	} else if (options.typescript.isExportDeclaration(node)) {
		return visitExportDeclaration({...options, node});
	} else if (options.typescript.isExportAssignment(node)) {
		return visitExportAssignment({...options, node});
	}
}
