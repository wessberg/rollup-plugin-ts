import {Node, Statement} from "typescript";
import {VisitorOptions} from "../visitor-options";

export interface UpdateExportsVisitorOptions<T extends Node> extends VisitorOptions<T> {
	isEntry: boolean;
	parsedExportedSymbolsMap: Map<string, Map<string, Statement>>;
	parsedExportedSymbols: Map<string, Statement>;
	exportedSpecifiersFromModule: Set<string>;
	getParsedExportedSymbolsForModule(moduleName: string): Map<string, Statement>;
	getExportedSpecifiersFromModule(moduleName: string): Set<string>;
}
