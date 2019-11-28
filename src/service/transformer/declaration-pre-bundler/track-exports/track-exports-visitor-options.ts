import {VisitorOptions} from "../visitor-options";
import {ExportedSymbol} from "../declaration-pre-bundler-options";
import {TS} from "../../../../type/ts";

export interface TrackExportsVisitorOptions<T extends TS.Node> extends VisitorOptions<T> {
	markAsExported(exportedSymbol: ExportedSymbol): void;
	setCurrentModuleSpecifier(moduleSpecifier: TS.Expression | undefined): void;
	getCurrentModuleSpecifier(): TS.Expression | undefined;
}
