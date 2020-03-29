import {TS} from "../../../../type/ts";
import {SourceFileBundlerVisitorOptions} from "../transformers/source-file-bundler/source-file-bundler-visitor-options";
import {getSymbolAtLocation, GetSymbolAtLocationOptions} from "./get-symbol-at-location";
import {getParentNode} from "./get-parent-node";
import {isSameChunk} from "./generate-module-specifier";

export interface GetAliasedDeclarationOptions extends SourceFileBundlerVisitorOptions {
	node: TS.Expression | TS.Symbol | TS.Declaration | TS.QualifiedName | TS.TypeNode | undefined;
}

export function getDeclarationFromSymbol(symbol: TS.Symbol): (TS.Declaration & {id: number}) | undefined {
	const valueDeclaration =
		symbol.valueDeclaration != null ? symbol.valueDeclaration : symbol.declarations != null ? symbol.declarations[0] : undefined;
	return valueDeclaration as TS.Declaration & {id: number};
}

export function getAliasedDeclarationFromSymbol(symbol: TS.Symbol, typeChecker: TS.TypeChecker): (TS.Declaration & {id: number}) | undefined {
	let valueDeclaration = getDeclarationFromSymbol(symbol);
	try {
		const aliasedDeclaration = typeChecker.getAliasedSymbol(symbol);
		if (
			aliasedDeclaration != null &&
			(aliasedDeclaration.valueDeclaration != null || (aliasedDeclaration.declarations != null && aliasedDeclaration.declarations.length > 0))
		) {
			valueDeclaration = (aliasedDeclaration.valueDeclaration != null
				? aliasedDeclaration.valueDeclaration
				: symbol.declarations != null
				? aliasedDeclaration.declarations[0]
				: undefined) as (TS.Declaration & {id: number}) | undefined;
		}
	} catch {}

	return valueDeclaration;
}

export function isSymbol(node: TS.Node | TS.Symbol): node is TS.Symbol {
	return "valueDeclaration" in node || "declarations" in node;
}

/**
 * Gets the Declaration for the given Expression
 */
export function getAliasedDeclaration(options: GetSymbolAtLocationOptions): (TS.Declaration & {id: number}) | undefined {
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

/**
 * Gets the Declaration for the given Expression
 */
export function getDeclaration(options: GetSymbolAtLocationOptions): (TS.Declaration & {id: number}) | undefined {
	const {node} = options;
	let symbol: TS.Symbol | undefined;
	try {
		symbol = node == null ? undefined : isSymbol(node) ? node : getSymbolAtLocation({...options, node});
	} catch {
		// Typescript couldn't produce a symbol for the Node
	}

	if (symbol == null) return undefined;
	return getDeclarationFromSymbol(symbol);
}

/**
 * In general, the "best" declaration is the non-aliased one, with the exception of import bindings that have been inlined in the chunk, in which case the actual declaration should be resolved and used.
 * This is where getAliasedDeclaration comes in handy.
 */
export function getBestDeclaration(options: GetAliasedDeclarationOptions & GetSymbolAtLocationOptions): (TS.Declaration & {id: number}) | undefined {
	const declaration = getDeclaration(options);
	if (declaration == null) return declaration;

	let moduleSpecifier: TS.Expression | undefined;
	if (options.typescript.isImportSpecifier(declaration)) {
		moduleSpecifier = getParentNode(getParentNode(getParentNode(declaration))).moduleSpecifier;
	} else if (options.typescript.isNamespaceImport(declaration)) {
		moduleSpecifier = getParentNode(getParentNode(declaration)).moduleSpecifier;
	} else if (options.typescript.isImportClause(declaration)) {
		moduleSpecifier = getParentNode(declaration).moduleSpecifier;
	} else if (
		options.typescript.isIdentifier(declaration) &&
		getParentNode(declaration) != null &&
		options.typescript.isImportClause(getParentNode(declaration))
	) {
		moduleSpecifier = getParentNode(getParentNode(declaration) as TS.ImportClause).moduleSpecifier;
	}

	if (moduleSpecifier == null || !options.typescript.isStringLiteralLike(moduleSpecifier)) {
		return declaration;
	}

	if (options.typescript.isStringLiteralLike(moduleSpecifier)) {
		if (isSameChunk({...options, moduleSpecifier: moduleSpecifier.text, from: options.sourceFile.fileName})) {
			return getAliasedDeclaration(options);
		}
	}

	return declaration;
}
