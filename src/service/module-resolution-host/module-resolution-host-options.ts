import {FileSystem} from "../../util/file-system/file-system";
import {TS} from "../../type/ts";
import {SupportedExtensions} from "../../util/get-supported-extensions/get-supported-extensions";
import {ParsedCommandLineResult} from "../../util/get-parsed-command-line/parsed-command-line-result";

export interface ModuleResolutionHostOptions {
	typescript: typeof TS;
	parsedCommandLineResult: ParsedCommandLineResult;
	extensions: SupportedExtensions;
	fileSystem: FileSystem;
	cwd: string;
}
