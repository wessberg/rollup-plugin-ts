import {TS} from "../../../../../../../type/ts";
import {isStatement} from "../../../util/is-statement";

export function isPrependableNode(node: TS.Node, typescript: typeof TS): boolean {
	return (
		typescript.isClassDeclaration(node) ||
		typescript.isClassExpression(node) ||
		typescript.isEnumDeclaration(node) ||
		typescript.isExportDeclaration(node) ||
		typescript.isExportAssignment(node) ||
		typescript.isFunctionDeclaration(node) ||
		typescript.isFunctionExpression(node) ||
		typescript.isExpressionStatement(node) ||
		typescript.isImportDeclaration(node) ||
		typescript.isImportEqualsDeclaration(node) ||
		typescript.isInterfaceDeclaration(node) ||
		typescript.isModuleDeclaration(node) ||
		typescript.isTypeAliasDeclaration(node) ||
		typescript.isVariableStatement(node) ||
		isStatement(node, typescript)
	);
}
