import {TS} from "../../../../type/ts";
import {ensureHasDeclareModifier} from "./modifier-util";
import {getAliasedDeclarationFromSymbol, isSymbol} from "./get-aliased-declaration";
import {LexicalEnvironment} from "../transformers/deconflicter/deconflicter-options";
import {generateUniqueBinding} from "./generate-unique-binding";
import {preserveParents} from "./clone-node-with-meta";

export function createAliasedBinding(
	node: TS.Node | TS.Symbol | undefined,
	propertyName: string,
	name: string,
	typescript: typeof TS,
	typeChecker: TS.TypeChecker,
	lexicalEnvironment: LexicalEnvironment
): (TS.ImportDeclaration | TS.TypeAliasDeclaration | TS.VariableStatement | TS.ModuleDeclaration | TS.ImportEqualsDeclaration)[] {
	const declaration = node != null && isSymbol(node) ? getAliasedDeclarationFromSymbol(node, typeChecker) : node;
	const moduleBinding = generateUniqueBinding(lexicalEnvironment, `${propertyName}Wrapper`);
	switch (declaration?.kind) {
		case typescript.SyntaxKind.ClassDeclaration:
		case typescript.SyntaxKind.ClassExpression: {
			return [
				preserveParents(
					typescript.createModuleDeclaration(
						undefined,
						undefined,
						typescript.createIdentifier(moduleBinding),
						typescript.createModuleBlock([
							typescript.createExportDeclaration(
								undefined,
								undefined,
								typescript.createNamedExports([typescript.createExportSpecifier(undefined, typescript.createIdentifier(propertyName))])
							)
						])
					),
					{typescript}
				),

				preserveParents(
					typescript.createImportEqualsDeclaration(
						undefined,
						undefined,
						typescript.createIdentifier(name),
						typescript.createQualifiedName(typescript.createIdentifier(moduleBinding), typescript.createIdentifier(propertyName))
					),
					{typescript}
				)
			];
		}
		case typescript.SyntaxKind.FunctionDeclaration:
		case typescript.SyntaxKind.FunctionExpression:
		case typescript.SyntaxKind.EnumDeclaration:
		case typescript.SyntaxKind.VariableDeclaration:
		case typescript.SyntaxKind.VariableStatement:
		case typescript.SyntaxKind.ExportAssignment: {
			return [
				preserveParents(
					typescript.createVariableStatement(
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
					),
					{typescript}
				)
			];
		}

		default: {
			return [
				preserveParents(
					typescript.createTypeAliasDeclaration(
						undefined,
						undefined,
						typescript.createIdentifier(name),
						undefined,
						typescript.createTypeReferenceNode(typescript.createIdentifier(propertyName), undefined)
					),
					{typescript}
				)
			];
		}
	}
}
