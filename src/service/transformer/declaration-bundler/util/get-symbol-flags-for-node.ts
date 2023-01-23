import type {TS} from "../../../../type/ts.js";

export function getSymbolFlagsForNode(node: TS.Node, typescript: typeof TS): TS.SymbolFlags {
	if (typescript.isClassLike(node)) {
		return typescript.SymbolFlags.Class;
	} else if (typescript.isVariableDeclaration(node)) {
		return typescript.SymbolFlags.Variable;
	} else if (typescript.isEnumDeclaration(node)) {
		return typescript.SymbolFlags.Enum;
	} else if (typescript.isEnumMember(node)) {
		return typescript.SymbolFlags.EnumMember;
	} else if (typescript.isPropertyDeclaration(node)) {
		return typescript.SymbolFlags.Property;
	} else if (typescript.isGetAccessor(node)) {
		return typescript.SymbolFlags.GetAccessor;
	} else if (typescript.isSetAccessor(node)) {
		return typescript.SymbolFlags.SetAccessor;
	} else if (typescript.isFunctionLike(node)) {
		return typescript.SymbolFlags.Function;
	} else if (typescript.isInterfaceDeclaration(node)) {
		return typescript.SymbolFlags.Interface;
	} else if (typescript.isModuleDeclaration(node)) {
		return typescript.SymbolFlags.Module;
	} else if (typescript.isTypeLiteralNode(node)) {
		return typescript.SymbolFlags.TypeLiteral;
	} else if (typescript.isObjectLiteralExpression(node)) {
		return typescript.SymbolFlags.ObjectLiteral;
	} else if (typescript.isMethodDeclaration(node)) {
		return typescript.SymbolFlags.Method;
	} else if (typescript.isConstructorDeclaration(node)) {
		return typescript.SymbolFlags.Constructor;
	} else if (typescript.isMethodSignature(node) || typescript.isCallSignatureDeclaration(node) || typescript.isPropertySignature(node)) {
		return typescript.SymbolFlags.Signature;
	} else if (typescript.isTypeParameterDeclaration(node)) {
		return typescript.SymbolFlags.TypeParameter;
	} else if (typescript.isTypeAliasDeclaration(node)) {
		return typescript.SymbolFlags.TypeAlias;
	}

	return typescript.SymbolFlags.None;
}
