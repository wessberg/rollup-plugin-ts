import type {TS} from "../../../../type/ts.js";
import {ensureHasDeclareModifier} from "./modifier-util.js";
import {getAliasedDeclarationFromSymbol, isSymbol} from "./get-aliased-declaration.js";
import type {LexicalEnvironment} from "../transformers/deconflicter/deconflicter-options.js";
import {generateUniqueBinding} from "./generate-unique-binding.js";
import {preserveParents} from "./clone-node-with-meta.js";
import type {TransformerBaseOptions} from "../transformers/transformer-base-options.js";
import {markAsInternalAlias} from "./node-util.js";

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
			const moduleDeclaration = factory.createModuleDeclaration(
				undefined,
				factory.createIdentifier(moduleBinding),
				factory.createModuleBlock([
					factory.createExportDeclaration(undefined, false, factory.createNamedExports([factory.createExportSpecifier(false, undefined, factory.createIdentifier(propertyName))]))
				])
			);

			const importEqualsDeclaration = factory.createImportEqualsDeclaration(
				undefined,
				false,
				factory.createIdentifier(name),
				factory.createQualifiedName(factory.createIdentifier(moduleBinding), factory.createIdentifier(propertyName))
			);

			// Typically module declarations are left in.
			// However, these should be treeshakeable.
			markAsInternalAlias(moduleDeclaration, typescript);
			markAsInternalAlias(importEqualsDeclaration, typescript);

			return [preserveParents(moduleDeclaration, {typescript}), preserveParents(importEqualsDeclaration, {typescript})];
		}
		case typescript.SyntaxKind.FunctionDeclaration:
		case typescript.SyntaxKind.FunctionExpression:
		case typescript.SyntaxKind.EnumDeclaration:
		case typescript.SyntaxKind.VariableDeclaration:
		case typescript.SyntaxKind.VariableStatement:
		case typescript.SyntaxKind.ExportAssignment: {
			const variableStatement = factory.createVariableStatement(
				ensureHasDeclareModifier(undefined, factory, typescript),
				factory.createVariableDeclarationList(
					[factory.createVariableDeclaration(factory.createIdentifier(name), undefined, factory.createTypeQueryNode(factory.createIdentifier(propertyName)))],
					typescript.NodeFlags.Const
				)
			);
			markAsInternalAlias(variableStatement, typescript);
			return [preserveParents(variableStatement, {typescript})];
		}

		default: {
			const alias =
				propertyName === "_default"
					? factory.createVariableStatement(
							ensureHasDeclareModifier(undefined, factory, typescript),
							factory.createVariableDeclarationList(
								[factory.createVariableDeclaration(factory.createIdentifier(name), undefined, factory.createTypeQueryNode(factory.createIdentifier(propertyName)))],
								typescript.NodeFlags.Const
							)
					  )
					: factory.createTypeAliasDeclaration(
							undefined,
							factory.createIdentifier(name),
							undefined,
							factory.createTypeReferenceNode(factory.createIdentifier(propertyName), undefined)
					  );
			markAsInternalAlias(alias, typescript);
			return [preserveParents(alias, {typescript})];
		}
	}
}
