import {TS} from "../../type/ts.js";
import {SupportedExtensions} from "../../util/get-supported-extensions/get-supported-extensions.js";
import {ParsedCommandLineResult} from "../../util/get-parsed-command-line/parsed-command-line-result.js";
import {ExternalOption} from "rollup";

export interface ModuleResolutionHostOptions {
	typescript: typeof TS;
	parsedCommandLineResult: ParsedCommandLineResult;
	extensions: SupportedExtensions;
	externalOption: ExternalOption | undefined;
	fileSystem: TS.System;
	cwd: string;
}
