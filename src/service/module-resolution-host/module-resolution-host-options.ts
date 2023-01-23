import type {TS} from "../../type/ts.js";
import type {SupportedExtensions} from "../../util/get-supported-extensions/get-supported-extensions.js";
import type {ParsedCommandLineResult} from "../../util/get-parsed-command-line/parsed-command-line-result.js";
import type {ExternalOption} from "rollup";

export interface ModuleResolutionHostOptions {
	typescript: typeof TS;
	parsedCommandLineResult: ParsedCommandLineResult;
	extensions: SupportedExtensions;
	externalOption: ExternalOption | undefined;
	fileSystem: TS.System;
	cwd: string;
}
