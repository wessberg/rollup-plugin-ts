import {ExportDeclaration, Node, Statement} from "typescript";
import {VisitorOptions} from "../visitor-options";

export interface UpdateExportsVisitorOptions<T extends Node> extends VisitorOptions<T> {
	isEntry: boolean;
	parsedExportedSymbolsMap: Map<string, Map<string, Statement>>;
	parsedExportedSymbols: Map<string, Statement>;
	exportedSpecifiersFromModule: Set<string>;
	exportsFromExternalModules: Map<string, ExportDeclaration>;
	getParsedExportedSymbolsForModule(moduleName: string): Map<string, Statement>;
	getExportedSpecifiersFromModule(moduleName: string): Set<string>;
	getExportsFromExternalModulesForModule(moduleName: string): Map<string, ExportDeclaration>;
}
