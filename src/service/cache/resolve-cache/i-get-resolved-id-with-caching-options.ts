import {CompilerOptions, ModuleResolutionHost} from "typescript";
import {IncrementalLanguageService} from "../../language-service/incremental-language-service";
import {SupportedExtensions} from "../../../util/get-supported-extensions/get-supported-extensions";

export interface IGetResolvedIdWithCachingOptions {
	id: string;
	parent: string;
	cwd: string;
	options: CompilerOptions;
	supportedExtensions: SupportedExtensions;
	moduleResolutionHost: ModuleResolutionHost | IncrementalLanguageService;
}
