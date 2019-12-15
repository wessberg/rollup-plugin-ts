import {TS} from "../../../../type/ts";
import {SourceFileBundlerVisitorOptions} from "../transformers/source-file-bundler/source-file-bundler-visitor-options";
import {getSymbolAtLocation} from "./get-symbol-at-location";

export interface GetAliasedDeclarationOptions extends SourceFileBundlerVisitorOptions {
	node: TS.Expression | TS.Symbol | TS.Declaration | TS.QualifiedName | undefined;
}

export function getAliasedDeclarationFromSymbol(symbol: TS.Symbol, typeChecker: TS.TypeChecker): TS.Declaration & {id: number} {
	let valueDeclaration = symbol.valueDeclaration != null ? symbol.valueDeclaration : symbol.declarations != null ? symbol.declarations[0] : undefined;
	try {
		const aliasedDeclaration = typeChecker.getAliasedSymbol(symbol);
		if (
			aliasedDeclaration != null &&
			(aliasedDeclaration.valueDeclaration != null || (aliasedDeclaration.declarations != null && aliasedDeclaration.declarations.length > 0))
		) {
			valueDeclaration =
				aliasedDeclaration.valueDeclaration != null
					? aliasedDeclaration.valueDeclaration
					: symbol.declarations != null
					? aliasedDeclaration.declarations[0]
					: undefined;
		}
	} catch {}

	return valueDeclaration as TS.Declaration & {id: number};
}

export function isSymbol(node: TS.Node | TS.Symbol): node is TS.Symbol {
	return "valueDeclaration" in node || "declarations" in node;
}

/**
 * Gets the Declaration for the given Expression
 */
export function getAliasedDeclaration(options: GetAliasedDeclarationOptions): (TS.Declaration & {id: number}) | undefined {
	const {node, typeChecker} = options;
	let symbol: TS.Symbol | undefined;
	try {
		symbol = node == null ? undefined : isSymbol(node) ? node : getSymbolAtLocation({...options, node});
	} catch {
		// Typescript couldn't produce a symbol for the Node
	}

	if (symbol == null) return undefined;
	return getAliasedDeclarationFromSymbol(symbol, typeChecker);
}
