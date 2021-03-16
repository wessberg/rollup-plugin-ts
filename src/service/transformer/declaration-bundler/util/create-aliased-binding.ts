import {TS} from "../../../../type/ts";
import {ensureHasDeclareModifier} from "./modifier-util";
import {getAliasedDeclarationFromSymbol, isSymbol} from "./get-aliased-declaration";
import {LexicalEnvironment} from "../transformers/deconflicter/deconflicter-options";
import {generateUniqueBinding} from "./generate-unique-binding";
import {preserveParents} from "./clone-node-with-meta";
import {CompatFactory} from "../transformers/source-file-bundler/source-file-bundler-visitor-options";
import {isNodeFactory} from "./is-node-factory";

export function createAliasedBinding(
	node: TS.Node | TS.Symbol | undefined,
	propertyName: string,
	name: string,
	typescript: typeof TS,
	compatFactory: CompatFactory,
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
					compatFactory.createModuleDeclaration(
						undefined,
						undefined,
						compatFactory.createIdentifier(moduleBinding),
						compatFactory.createModuleBlock([
							isNodeFactory(compatFactory)
								? compatFactory.createExportDeclaration(
										undefined,
										undefined,
										false,
										compatFactory.createNamedExports([compatFactory.createExportSpecifier(undefined, compatFactory.createIdentifier(propertyName))])
								  )
								: compatFactory.createExportDeclaration(
										undefined,
										undefined,
										compatFactory.createNamedExports([compatFactory.createExportSpecifier(undefined, compatFactory.createIdentifier(propertyName))])
								  )
						])
					),
					{typescript}
				),

				preserveParents(
					compatFactory.createImportEqualsDeclaration.length === 4 ?
						(compatFactory as unknown as import("typescript-4-1-2").NodeFactory).createImportEqualsDeclaration(
						undefined,
						undefined,
						compatFactory.createIdentifier(name),
						compatFactory.createQualifiedName(compatFactory.createIdentifier(moduleBinding), compatFactory.createIdentifier(propertyName))
					) as TS.ImportEqualsDeclaration : compatFactory.createImportEqualsDeclaration(
						undefined,
						undefined,
						false,
						compatFactory.createIdentifier(name),
						compatFactory.createQualifiedName(compatFactory.createIdentifier(moduleBinding), compatFactory.createIdentifier(propertyName))
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
					compatFactory.createVariableStatement(
						ensureHasDeclareModifier(undefined, compatFactory, typescript),
						compatFactory.createVariableDeclarationList(
							[
								isNodeFactory(compatFactory)
									? compatFactory.createVariableDeclaration(
											compatFactory.createIdentifier(name),
											undefined,
											compatFactory.createTypeQueryNode(compatFactory.createIdentifier(propertyName))
									  )
									: compatFactory.createVariableDeclaration(compatFactory.createIdentifier(name), compatFactory.createTypeQueryNode(compatFactory.createIdentifier(propertyName)))
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
					compatFactory.createTypeAliasDeclaration(
						undefined,
						undefined,
						compatFactory.createIdentifier(name),
						undefined,
						compatFactory.createTypeReferenceNode(compatFactory.createIdentifier(propertyName), undefined)
					),
					{typescript}
				)
			];
		}
	}
}
