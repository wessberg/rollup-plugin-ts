import {OutputOptions, PluginContext} from "rollup";
import {LanguageService} from "typescript";
import {IncrementalLanguageService} from "../../service/language-service/incremental-language-service";
import {IEmitCache} from "../../service/cache/emit-cache/i-emit-cache";
import {FileSystem} from "../file-system/file-system";
import {TypescriptPluginOptions} from "../../plugin/i-typescript-plugin-options";
import {Resolver} from "../resolve-id/resolver";
import {MergedChunk} from "../chunk/merge-chunks-with-ambient-dependencies";
import {SupportedExtensions} from "../get-supported-extensions/get-supported-extensions";

export interface IEmitDeclarationsOptions {
	resolver: Resolver;
	pluginContext: PluginContext;
	fileSystem: FileSystem;
	cwd: string;
	outDir: string;
	declarationOutDir: string;
	generateMap: boolean;
	chunk: MergedChunk;
	localModuleNames: string[];
	entryFileNames: string[];
	pluginOptions: TypescriptPluginOptions;
	outputOptions: OutputOptions;
	languageService: LanguageService;
	languageServiceHost: IncrementalLanguageService;
	emitCache: IEmitCache;
	chunkToOriginalFileMap: Map<string, string[]>;
	supportedExtensions: SupportedExtensions;
}
