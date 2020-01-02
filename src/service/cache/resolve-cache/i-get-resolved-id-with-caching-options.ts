import {LanguageServiceHost} from "../../language-service/language-service-host";

export interface IGetResolvedIdWithCachingOptions {
	id: string;
	parent: string;
	moduleResolutionHost: LanguageServiceHost;
}
