import type {TS} from "../../../../../type/ts.js";
import type {CompilerHost} from "../../../../compiler-host/compiler-host.js";
import type {PathsResult} from "../../util/prepare-paths/prepare-paths.js";
import type {TypeReference} from "../../util/get-type-reference-module-from-file-name.js";

export interface StatsCollectorOptions {
	typescript: typeof TS;
	sourceFile: TS.SourceFile;
	host: CompilerHost;
	declarationPaths: PathsResult;
	sourceFileToTypeReferencesSet: Map<string, Set<TypeReference>>;
}
