import {Node} from "typescript";
import {VisitorOptions} from "../visitor-options";
import {ExportedSymbol} from "../declaration-pre-bundler-options";

export interface TrackExportsVisitorOptions<T extends Node> extends VisitorOptions<T> {
	markAsExported(exportedSymbol: ExportedSymbol): void;
}
