/**
 * These constants represent the names of things that are relevant to any compilation, no matter the content
 * @type {object}
 */
export const NAME = {
	diagnostic: {
		scope: "FV",
		source: "Fovea"
	},
	package: {
		lib: "@fovea/lib",
		core: "@fovea/core"
	},
	host: {
		selector: {
			suffixSuggestion: "component"
		},
		lifecycle: {
			callback: {
				connected: "connectedCallback",
				disconnected: "disconnectedCallback",
				observedAttributes: "observedAttributes",
				attributeChanged: "attributeChangedCallback",
				destroyed: "destroyedCallback"
			}
		},
		member: {
			preCompile: {
				property: {
					template: "template",
					styles: "styles"
				},
				decorator: {
					prop: "prop",
					templateSrc: "templateSrc",
					styleSrc: "styleSrc",
					setOnHost: "setOnHost",
					emit: "emit",
					listener: "listener",
					dependsOn: "dependsOn",
					onBecameVisible: "onBecameVisible",
					onBecameInvisible: "onBecameInvisible",
					onChildrenAdded: "onChildrenAdded",
					onChildrenRemoved: "onChildrenRemoved",
					onChange: "onChange",
					onAttributeChange: "onAttributeChange",
					customElement: "customElement",
					customAttribute: "customAttribute",
					hostAttributes: "hostAttributes"
				}
			},
			postCompile: {
				property: {
					compilerFlags: "___compilerFlags",
					hostElement: "___hostElement"
				},
				method: {
					registerChangeObservers: "___registerChangeObservers",
					registerProps: "___registerProps",
					registerSetOnHostProps: "___registerSetOnHostProps",
					registerListeners: "___registerListeners",
					registerEmitters: "___registerEmitters",
					registerVisibilityObservers: "___registerVisibilityObservers",
					registerChildListObservers: "___registerChildListObservers",
					registerAttributeChangeObservers: "___registerAttributeChangeObservers",
					registerHostAttributes: "___registerHostAttributes",
					useCSS: "___useCSS",
					useTemplates: "___useTemplates",
					connectTemplates: "___connectTemplates",
					connectCSS: "___connectCSS",
					connectProps: "___connectProps",
					connectListeners: "___connectListeners",
					connectVisibilityObservers: "___connectVisibilityObservers",
					connectChildListObservers: "___connectChildListObservers",
					connectAttributeChangeObservers: "___connectAttributeChangeObservers",
					connectHostAttributes: "___connectHostAttributes",
					disposeProps: "___disposeProps",
					disposeListeners: "___disposeListeners",
					disposeVisibilityObservers: "___disposeVisibilityObservers",
					disposeTemplates: "___disposeTemplates",
					disposeCSS: "___disposeCSS",
					disposeChildListObservers: "___disposeChildListObservers",
					disposeAttributeChangeObservers: "___disposeAttributeChangeObservers",
					disposeHostAttributes: "___disposeHostAttributes",
					destroyTemplates: "___destroyTemplates"
				}
			}
		}
	},
	annotation: {
		pure: "/*#__PURE__*/"
	}
};

export type FoveaDecoratorName = keyof typeof NAME.host.member.preCompile.decorator;
export type FoveaDecoratorCustomHostName = keyof Pick<typeof NAME.host.member.preCompile.decorator, "customElement"|"customAttribute">;