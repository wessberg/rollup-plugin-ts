import {FoveaDiagnosticKind} from "./fovea-diagnostic-kind";
import {FoveaDiagnosticDegree} from "./fovea-diagnostic-degree";

export interface IFoveaDiagnostic {
	kind: FoveaDiagnosticKind;
	degree: FoveaDiagnosticDegree;
	file: string;
	description: string;
}

export interface IUnknownSelectorFoveaDiagnostic extends IFoveaDiagnostic {
	kind: FoveaDiagnosticKind.UNKNOWN_SELECTOR;
	degree: FoveaDiagnosticDegree.WARNING;
	selector: string;
}

export interface IAmbiguousHostFoveaDiagnostic extends IFoveaDiagnostic {
	kind: FoveaDiagnosticKind.AMBIGUOUS_HOST;
	degree: FoveaDiagnosticDegree.ERROR;
}

export interface IInvalidSrcDecoratorUsageFoveaDiagnostic extends IFoveaDiagnostic {
	kind: FoveaDiagnosticKind.INVALID_SRC_DECORATOR_USAGE;
	degree: FoveaDiagnosticDegree.ERROR;
}

export interface IInvalidDependsOnDecoratorUsageFoveaDiagnostic extends IFoveaDiagnostic {
	kind: FoveaDiagnosticKind.INVALID_DEPENDS_ON_DECORATOR_USAGE;
	degree: FoveaDiagnosticDegree.ERROR;
}

export interface IInvalidSelectorDecoratorUsageFoveaDiagnostic extends IFoveaDiagnostic {
	kind: FoveaDiagnosticKind.INVALID_SELECTOR_DECORATOR_USAGE;
	degree: FoveaDiagnosticDegree.ERROR;
}

export interface IInvalidOnChangeDecoratorUsageFoveaDiagnostic extends IFoveaDiagnostic {
	kind: FoveaDiagnosticKind.INVALID_ON_CHANGE_DECORATOR_USAGE;
	degree: FoveaDiagnosticDegree.ERROR;
}

export interface IInvalidHostListenerDecoratorUsageFoveaDiagnostic extends IFoveaDiagnostic {
	kind: FoveaDiagnosticKind.INVALID_HOST_LISTENER_DECORATOR_USAGE;
	degree: FoveaDiagnosticDegree.ERROR;
}

export interface IInvalidHostAttributesDecoratorUsageFoveaDiagnostic extends IFoveaDiagnostic {
	kind: FoveaDiagnosticKind.INVALID_HOST_ATTRIBUTES_DECORATOR_USAGE;
	degree: FoveaDiagnosticDegree.ERROR;
}

export interface IInvalidVisibilityObserverDecoratorUsageFoveaDiagnostic extends IFoveaDiagnostic {
	kind: FoveaDiagnosticKind.INVALID_VISIBILITY_OBSERVER_DECORATOR_USAGE;
	degree: FoveaDiagnosticDegree.ERROR;
}

export interface IInvalidChildListObserverDecoratorUsageFoveaDiagnostic extends IFoveaDiagnostic {
	kind: FoveaDiagnosticKind.INVALID_CHILD_LIST_OBSERVER_DECORATOR_USAGE;
	degree: FoveaDiagnosticDegree.ERROR;
}

export interface IInvalidAttributeObserverDecoratorUsageFoveaDiagnostic extends IFoveaDiagnostic {
	kind: FoveaDiagnosticKind.INVALID_ATTRIBUTE_OBSERVER_DECORATOR_USAGE;
	degree: FoveaDiagnosticDegree.ERROR;
}

export interface IUnresolvedSrcFoveaDiagnostic extends IFoveaDiagnostic {
	kind: FoveaDiagnosticKind.UNRESOLVED_SRC;
	degree: FoveaDiagnosticDegree.ERROR;
}

export interface IInvalidSelectorNeedsHyphenFoveaDiagnostic extends IFoveaDiagnostic {
	kind: FoveaDiagnosticKind.INVALID_SELECTOR_NEEDS_HYPHEN;
	degree: FoveaDiagnosticDegree.ERROR;
}

export interface IInvalidSelectorHasWhitespaceFoveaDiagnostic extends IFoveaDiagnostic {
	kind: FoveaDiagnosticKind.INVALID_SELECTOR_HAS_WHITESPACE;
	degree: FoveaDiagnosticDegree.ERROR;
}

export interface IInvalidSelectorIsNotAllLowerCaseFoveaDiagnostic extends IFoveaDiagnostic {
	kind: FoveaDiagnosticKind.INVALID_SELECTOR_IS_NOT_ALL_LOWER_CASE;
	degree: FoveaDiagnosticDegree.ERROR;
}

export interface IOnlyLiteralValuesSupportedHereFoveaDiagnostic extends IFoveaDiagnostic {
	kind: FoveaDiagnosticKind.ONLY_LITERAL_VALUES_SUPPORTED_HERE;
	degree: FoveaDiagnosticDegree.ERROR;
}

export interface IInvalidCssFoveaDiagnostic extends IFoveaDiagnostic {
	kind: FoveaDiagnosticKind.INVALID_CSS;
	degree: FoveaDiagnosticDegree.ERROR;
}

export interface IInvalidTemplateFoveaDiagnostic extends IFoveaDiagnostic {
	kind: FoveaDiagnosticKind.INVALID_TEMPLATE;
	degree: FoveaDiagnosticDegree.ERROR;
}

export declare type FoveaDiagnostic =
	IUnknownSelectorFoveaDiagnostic|
	IAmbiguousHostFoveaDiagnostic|
	IInvalidSrcDecoratorUsageFoveaDiagnostic|
	IInvalidDependsOnDecoratorUsageFoveaDiagnostic|
	IInvalidSelectorDecoratorUsageFoveaDiagnostic|
	IInvalidOnChangeDecoratorUsageFoveaDiagnostic|
	IInvalidHostListenerDecoratorUsageFoveaDiagnostic|
	IInvalidVisibilityObserverDecoratorUsageFoveaDiagnostic|
	IInvalidChildListObserverDecoratorUsageFoveaDiagnostic|
	IInvalidAttributeObserverDecoratorUsageFoveaDiagnostic|
	IUnresolvedSrcFoveaDiagnostic|
	IInvalidSelectorNeedsHyphenFoveaDiagnostic|
	IInvalidSelectorHasWhitespaceFoveaDiagnostic|
	IInvalidSelectorIsNotAllLowerCaseFoveaDiagnostic|
	IInvalidCssFoveaDiagnostic|
	IInvalidTemplateFoveaDiagnostic|
	IInvalidHostAttributesDecoratorUsageFoveaDiagnostic|
	IOnlyLiteralValuesSupportedHereFoveaDiagnostic;