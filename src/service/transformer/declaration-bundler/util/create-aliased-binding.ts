import {TS} from "../../../../type/ts";
import {ensureHasDeclareModifier} from "./modifier-util";
import {getAliasedDeclarationFromSymbol, isSymbol} from "./get-aliased-declaration";
import {LexicalEnvironment} from "../transformers/deconflicter/deconflicter-options";
import {generateUniqueBinding} from "./generate-unique-binding";
import {preserveParents} from "./clone-node-with-meta";
import {TransformerBaseOptions} from "../transformers/transformer-base-options";

export interface CreateAliasedBindingOptions extends TransformerBaseOptions {
	node: TS.Node | TS.Symbol | undefined;
	propertyName: string;
	name: string;
	typeChecker: TS.TypeChecker;
	lexicalEnvironment: LexicalEnvironment;
}

export function createAliasedBinding({
	factory,
	typescript,
	lexicalEnvironment,
	name,
	node,
	propertyName,
	typeChecker
}: CreateAliasedBindingOptions): (TS.ImportDeclaration | TS.TypeAliasDeclaration | TS.VariableStatement | TS.ModuleDeclaration | TS.ImportEqualsDeclaration)[] {
	const declaration = node != null && isSymbol(node) ? getAliasedDeclarationFromSymbol(node, typeChecker) : node;
	const moduleBinding = generateUniqueBinding(lexicalEnvironment, `${propertyName}Wrapper`);
	switch (declaration?.kind) {
		case typescript.SyntaxKind.ClassDeclaration:
		case typescript.SyntaxKind.ClassExpression: {
			return [
				preserveParents(
					factory.createModuleDeclaration(
						undefined,
						undefined,
						factory.createIdentifier(moduleBinding),
						factory.createModuleBlock([
							factory.createExportDeclaration(
								undefined,
								undefined,
								false,
								factory.createNamedExports([factory.createExportSpecifier(false, undefined, factory.createIdentifier(propertyName))])
							)
						])
					),
					{typescript}
				),

				preserveParents(
					factory.createImportEqualsDeclaration(
						undefined,
						undefined,
						false,
						factory.createIdentifier(name),
						factory.createQualifiedName(factory.createIdentifier(moduleBinding), factory.createIdentifier(propertyName))
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
					factory.createVariableStatement(
						ensureHasDeclareModifier(undefined, factory, typescript),
						factory.createVariableDeclarationList(
							[factory.createVariableDeclaration(factory.createIdentifier(name), undefined, factory.createTypeQueryNode(factory.createIdentifier(propertyName)))],
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
					factory.createTypeAliasDeclaration(
						undefined,
						undefined,
						factory.createIdentifier(name),
						undefined,
						factory.createTypeReferenceNode(factory.createIdentifier(propertyName), undefined)
					),
					{typescript}
				)
			];
		}
	}
}
