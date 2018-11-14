import {IPreCompileConfiguration} from "./pre-compile/i-pre-compile-configuration";
import {IPostCompileConfiguration} from "./post-compile/i-post-compile-configuration";

export interface IConfiguration {
	preCompile: IPreCompileConfiguration;
	postCompile: IPostCompileConfiguration;
	connectedCallbackName: string;
	disconnectedCallbackName: string;
	destroyedCallbackName: string;
	observedAttributesName: string;
	attributeChangedCallbackName: string;
	foveaLibModuleName: string;
	foveaModuleName: string;
	componentFallbackSuffix: string;
	annotation: {
		pureAnnotation: string;
	};
}