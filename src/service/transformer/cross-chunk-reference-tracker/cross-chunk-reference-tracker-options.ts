import {TrackExportsOptions} from "./transformers/track-exports-transformer/track-exports-transformer-visitor-options";
import {SupportedExtensions} from "../../../util/get-supported-extensions/get-supported-extensions";
import {TrackImportsOptions} from "./transformers/track-imports-transformer/track-imports-transformer-visitor-options";
import {TS} from "../../../type/ts";
import {SourceFileTrackerVisitorOptions} from "./transformers/source-file-tracker/source-file-tracker-visitor-options";
import {TypescriptPluginOptions} from "../../../plugin/i-typescript-plugin-options";
import {ModuleSpecifierToSourceFileMap} from "../declaration-bundler/declaration-bundler-options";

export type CrossChunkReferenceTransformer = (options: SourceFileTrackerVisitorOptions) => TS.SourceFile;

export interface CrossChunkReferenceTrackerOptions extends Omit<TrackExportsOptions, "sourceFile">, Omit<TrackImportsOptions, "sourceFile"> {
	// A Map between module specifiers and the SourceFiles they point to
	moduleSpecifierToSourceFileMap: ModuleSpecifierToSourceFileMap;
	supportedExtensions: SupportedExtensions;
	pluginOptions: TypescriptPluginOptions;
	printer: TS.Printer;
}
