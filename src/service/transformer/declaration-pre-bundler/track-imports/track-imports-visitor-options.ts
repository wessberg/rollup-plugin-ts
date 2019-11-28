import {VisitorOptions} from "../visitor-options";
import {ImportedSymbol} from "../declaration-pre-bundler-options";
import {TS} from "../../../../type/ts";

export interface TrackImportsVisitorOptions<T extends TS.Node> extends VisitorOptions<T> {
	setCurrentModuleSpecifier(moduleSpecifier: TS.Expression | undefined): void;
	getCurrentModuleSpecifier(): TS.Expression | undefined;
	markAsImported(exportedSymbol: ImportedSymbol): void;
}
