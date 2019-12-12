import {TS} from "../../../../type/ts";
import {ensureHasDeclareModifier} from "./modifier-util";

export function createAliasedBinding(
	node: TS.Node | undefined,
	propertyName: string,
	name: string,
	typescript: typeof TS
): TS.ImportDeclaration | TS.TypeAliasDeclaration | TS.VariableStatement {
	switch (node?.kind) {
		case typescript.SyntaxKind.ClassDeclaration:
		case typescript.SyntaxKind.ClassExpression:
		case typescript.SyntaxKind.FunctionDeclaration:
		case typescript.SyntaxKind.FunctionExpression:
		case typescript.SyntaxKind.EnumDeclaration:
		case typescript.SyntaxKind.VariableDeclaration:
		case typescript.SyntaxKind.VariableStatement:
		case typescript.SyntaxKind.ExportAssignment: {
			return typescript.createVariableStatement(
				ensureHasDeclareModifier(undefined, typescript),
				typescript.createVariableDeclarationList(
					[
						typescript.createVariableDeclaration(
							typescript.createIdentifier(name),
							typescript.createTypeQueryNode(typescript.createIdentifier(propertyName))
						)
					],
					typescript.NodeFlags.Const
				)
			);
		}

		default: {
			return typescript.createTypeAliasDeclaration(
				undefined,
				undefined,
				typescript.createIdentifier(name),
				undefined,
				typescript.createTypeReferenceNode(typescript.createIdentifier(propertyName), undefined)
			);
		}
	}
}
