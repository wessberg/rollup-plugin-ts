import {RenderedChunk} from "rollup";
import {CompilerOptions} from "typescript";
import {DeclarationCompilerHost} from "../../service/compiler-host/declaration-compiler-host";

export interface IFlattenDeclarationsFromRollupChunkOptions {
	chunk: RenderedChunk;
	options: CompilerOptions;
	compilerHost: DeclarationCompilerHost;
}