import {IReferencedCustomSelector} from "@fovea/dom";
import {IDeclaredCustomSelector} from "./i-declared-custom-selector";

export interface IMutableCompilerHintStats {
	hasStaticCSS: boolean;
	hasHostAttributes: boolean;
	hasSyncEvaluations: boolean;
	hasAsyncEvaluations: boolean;
	hasCustomElements: boolean;
	hasCustomAttributes: boolean;
	hasHostListeners: boolean;
	hasVisibilityObservers: boolean;
	hasChildListObservers: boolean;
	hasAttributeChangeObservers: boolean;
	hasChangeObservers: boolean;
	hasTemplateListeners: boolean;
	hasTemplateCustomAttributes: boolean;
	hasTemplateRefs: boolean;
	hasTemplateAttributes: boolean;
	hasHostProps: boolean;
	hasProps: boolean;
	hasEventEmitters: boolean;
}

export declare type IImmutableCompilerHintStats = Readonly<IMutableCompilerHintStats>;

export interface IMutableFoveaStats extends IMutableCompilerHintStats {
	declaredCustomSelectors: IDeclaredCustomSelector[];
	referencedCustomSelectors: IReferencedCustomSelector[];
	componentNames: string[];
	fileDependencies: string[];
}

export declare type IImmutableFoveaStats = Readonly<IMutableFoveaStats>;