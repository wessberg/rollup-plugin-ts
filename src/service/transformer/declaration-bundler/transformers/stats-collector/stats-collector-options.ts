import {TS} from "../../../../../type/ts.js";
import {CompilerHost} from "../../../../compiler-host/compiler-host.js";
import {PathsResult} from "../../util/prepare-paths/prepare-paths.js";
import {TypeReference} from "../../util/get-type-reference-module-from-file-name.js";

export interface StatsCollectorOptions {
	typescript: typeof TS;
	sourceFile: TS.SourceFile;
	host: CompilerHost;
	declarationPaths: PathsResult;
	sourceFileToTypeReferencesSet: Map<string, Set<TypeReference>>;
}
