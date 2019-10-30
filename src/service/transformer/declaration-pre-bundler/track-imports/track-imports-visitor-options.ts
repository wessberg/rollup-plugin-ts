import {Node} from "typescript";
import {VisitorOptions} from "../visitor-options";
import {ImportedSymbol} from "../declaration-pre-bundler-options";

export interface TrackImportsVisitorOptions<T extends Node> extends VisitorOptions<T> {
	markAsImported(exportedSymbol: ImportedSymbol): void;
}
