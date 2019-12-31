import {TS} from "../../../../../../type/ts";
import {isStatement} from "../../../util/is-statement";

export function isRootLevelNode(node: TS.VisitResult<TS.Node>, typescript: typeof TS): node is TS.Statement {
	return (
		node != null &&
		!Array.isArray(node) &&
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
