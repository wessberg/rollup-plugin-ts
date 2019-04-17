import {Declaration, Expression, Symbol, TypeChecker} from "typescript";

/**
 * Gets the Declaration for the given Expression
 * @param {Expression|Symbol} node
 * @param {TypeChecker} typeChecker
 * @return {Declaration | undefined}
 */
export function getAliasedDeclaration(node: Expression | Symbol | undefined, typeChecker: TypeChecker): Declaration | undefined {
	let symbol: Symbol | undefined;
	try {
		symbol = node == null ? undefined : "valueDeclaration" in node || "declarations" in node ? node : typeChecker.getSymbolAtLocation(node);
	} catch {
		// Typescript couldn't produce a symbol for the Node
	}

	if (symbol == null) return undefined;
	let valueDeclaration = symbol.valueDeclaration != null ? symbol.valueDeclaration : symbol.declarations != null ? symbol.declarations[0] : undefined;
	try {
		const aliasedDeclaration = typeChecker.getAliasedSymbol(symbol);
		if (aliasedDeclaration != null && (aliasedDeclaration.valueDeclaration != null || (aliasedDeclaration.declarations != null && aliasedDeclaration.declarations.length > 0))) {
			valueDeclaration = aliasedDeclaration.valueDeclaration != null ? aliasedDeclaration.valueDeclaration : symbol.declarations != null ? aliasedDeclaration.declarations[0] : undefined;
		}
	} catch {}

	return valueDeclaration;
}
