import {ExportDeclaration, Node, Statement} from "typescript";
import {VisitorOptions} from "../visitor-options";

export interface UpdateExportsVisitorOptions<T extends Node> extends VisitorOptions<T> {
	isEntry: boolean;
	parsedExportedSymbolsMap: Map<string, Map<string, [string | undefined, Statement]>>;
	parsedExportedSymbols: Map<string, [string | undefined, Statement]>;
	exportedSpecifiersFromModule: Set<string>;
	exportsFromExternalModules: Map<string, ExportDeclaration>;
	getParsedExportedSymbolsForModule(moduleName: string): Map<string, [string | undefined, Statement]>;
	getExportedSpecifiersFromModule(moduleName: string): Set<string>;
	getExportsFromExternalModulesForModule(moduleName: string): Map<string, ExportDeclaration>;
}
