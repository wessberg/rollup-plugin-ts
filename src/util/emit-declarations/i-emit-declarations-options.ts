import {OutputChunk, OutputOptions, PluginContext} from "rollup";
import {LanguageService} from "typescript";
import {IncrementalLanguageService} from "../../service/language-service/incremental-language-service";
import {IEmitCache} from "../../service/cache/emit-cache/i-emit-cache";
import {FileSystem} from "../file-system/file-system";

export interface IEmitDeclarationsOptions {
	pluginContext: PluginContext;
	fileSystem: FileSystem;
	cwd: string;
	outDir: string;
	declarationOutDir: string;
	generateMap: boolean;
	chunk: OutputChunk;
	moduleNames: string[];
	localModuleNames: string[];
	entryFileNames: string[];
	outputOptions: OutputOptions;
	languageService: LanguageService;
	languageServiceHost: IncrementalLanguageService;
	emitCache: IEmitCache;
	chunkToOriginalFileMap: Map<string, string[]>;
	supportedExtensions: string[];
}
