import {FileSystem} from "../../util/file-system/file-system";
import {TS} from "../../type/ts";
import {SupportedExtensions} from "../../util/get-supported-extensions/get-supported-extensions";

export interface ModuleResolutionHostOptions {
	typescript: typeof TS;
	parsedCommandLine: TS.ParsedCommandLine;
	extensions: SupportedExtensions;
	fileSystem: FileSystem;
	cwd: string;
}
