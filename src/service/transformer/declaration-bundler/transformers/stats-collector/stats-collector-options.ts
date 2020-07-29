import {TS} from "../../../../../type/ts";
import {CompilerHost} from "../../../../compiler-host/compiler-host";
import {PathsResult} from "../../util/prepare-paths/prepare-paths";
import {TypeReference} from "../../util/get-type-reference-module-from-file-name";

export interface StatsCollectorOptions {
	typescript: typeof TS;
	sourceFile: TS.SourceFile;
	host: CompilerHost;
	declarationPaths: PathsResult;
	sourceFileToTypeReferencesSet: Map<string, Set<TypeReference>>;
}
