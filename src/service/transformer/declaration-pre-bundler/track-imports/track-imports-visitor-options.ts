import {Expression, Node} from "typescript";
import {VisitorOptions} from "../visitor-options";
import {ImportedSymbol} from "../declaration-pre-bundler-options";

export interface TrackImportsVisitorOptions<T extends Node> extends VisitorOptions<T> {
	setCurrentModuleSpecifier(moduleSpecifier: Expression | undefined): void;
	getCurrentModuleSpecifier(): Expression | undefined;
	markAsImported(exportedSymbol: ImportedSymbol): void;
}
