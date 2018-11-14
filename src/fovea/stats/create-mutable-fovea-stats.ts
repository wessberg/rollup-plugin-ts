import {IMutableFoveaStats} from "./i-fovea-stats";

/**
 * Creates an empty stats object
 * @returns {IMutableFoveaStats}
 */
export function createMutableFoveaStats (): IMutableFoveaStats {
	return {
		declaredCustomSelectors: [],
		referencedCustomSelectors: [],
		fileDependencies: [],
		componentNames: [],
		hasHostAttributes: false,
		hasStaticCSS: false,
		hasSyncEvaluations: false,
		hasAsyncEvaluations: false,
		hasCustomElements: false,
		hasCustomAttributes: false,
		hasEventEmitters: false,
		hasHostListeners: false,
		hasVisibilityObservers: false,
		hasChildListObservers: false,
		hasAttributeChangeObservers: false,
		hasChangeObservers: false,
		hasHostProps: false,
		hasProps: false,
		hasTemplateListeners: false,
		hasTemplateCustomAttributes: false,
		hasTemplateAttributes: false,
		hasTemplateRefs: false
	};
}