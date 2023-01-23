import type {TS} from "../../../../../../type/ts.js";
import {isArray} from "../../../../../../util/object/object-util.js";
import {isStatement} from "../../../util/is-statement.js";

export function isRootLevelNode(node: TS.VisitResult<TS.Node>, typescript: typeof TS): node is TS.Statement {
	return (
		node != null &&
		!isArray(node) &&
		(typescript.isClassDeclaration(node) ||
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
			isStatement(node, typescript))
	);
}
