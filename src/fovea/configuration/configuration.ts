import {IConfiguration} from "./i-configuration";
import {preCompileConfiguration} from "./pre-compile/pre-compile-configuration";
import {postCompileConfiguration} from "./post-compile/post-compile-configuration";

export const configuration: IConfiguration = {
	preCompile: preCompileConfiguration,
	postCompile: postCompileConfiguration,
	connectedCallbackName: "connectedCallback",
	disconnectedCallbackName: "disconnectedCallback",
	observedAttributesName: "observedAttributes",
	attributeChangedCallbackName: "attributeChangedCallback",
	destroyedCallbackName: "destroyedCallback",
	foveaLibModuleName: "@fovea/lib",
	foveaModuleName: "@fovea/core",
	componentFallbackSuffix: "component",
	annotation: {
		pureAnnotation: "/*#__PURE__*/"
	}
};