import {IncrementalLanguageService} from "../../language-service/incremental-language-service";
import {SupportedExtensions} from "../../../util/get-supported-extensions/get-supported-extensions";
import {TS} from "../../../type/ts";

export interface IGetResolvedIdWithCachingOptions {
	id: string;
	parent: string;
	cwd: string;
	options: TS.CompilerOptions;
	supportedExtensions: SupportedExtensions;
	moduleResolutionHost: TS.ModuleResolutionHost | IncrementalLanguageService;
	typescript: typeof TS;
}
