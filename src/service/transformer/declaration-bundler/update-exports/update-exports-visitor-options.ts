import {Node} from "typescript";
import {VisitorOptions} from "../visitor-options";

export interface UpdateExportsVisitorOptions<T extends Node> extends VisitorOptions<T> {
	isEntry: boolean;
	getParsedExportedSymbolsForModule(moduleName: string): Set<string>;
	getExportedSpecifiersFromModule(moduleName: string): Set<string>;
	parsedExportedSymbols: Set<string>;
	exportedSpecifiersFromModule: Set<string>;

	isIdentifierFree(identifier: string): boolean;
	rootLevelIdentifiersForModule: Set<string>;
	generateUniqueVariableName(candidate: string): string;
}
