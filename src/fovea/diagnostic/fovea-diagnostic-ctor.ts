import {FoveaDiagnosticKind} from "./fovea-diagnostic-kind";
import {FoveaHostKind} from "@fovea/common";

export interface IFoveaDiagnosticCtor {
	kind: FoveaDiagnosticKind;
}

export interface IUnknownSelectorFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	kind: FoveaDiagnosticKind.UNKNOWN_SELECTOR;
	hostKind: FoveaHostKind|string;
	selector: string;
	hostName: string;
}

export interface IAmbiguousHostFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	kind: FoveaDiagnosticKind.AMBIGUOUS_HOST;
	hostName: string;
	extendsName: string;
}

export interface IInvalidSrcDecoratorUsageFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	kind: FoveaDiagnosticKind.INVALID_SRC_DECORATOR_USAGE;
	hostKind: FoveaHostKind|string;
	hostName: string;
	decoratorContent: string;
}

export interface IInvalidDependsOnDecoratorUsageFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	kind: FoveaDiagnosticKind.INVALID_DEPENDS_ON_DECORATOR_USAGE;
	hostKind: FoveaHostKind|string;
	hostName: string;
	decoratorContent: string;
}

export interface IInvalidSelectorDecoratorUsageFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	kind: FoveaDiagnosticKind.INVALID_SELECTOR_DECORATOR_USAGE;
	hostKind: FoveaHostKind|string;
	hostName: string;
	decoratorContent: string;
}

export interface IInvalidOnChangeDecoratorUsageFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	kind: FoveaDiagnosticKind.INVALID_ON_CHANGE_DECORATOR_USAGE;
	hostKind: FoveaHostKind|string;
	hostName: string;
	methodName: string;
	decoratorContent: string;
}

export interface IInvalidHostListenerDecoratorUsageFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	kind: FoveaDiagnosticKind.INVALID_HOST_LISTENER_DECORATOR_USAGE;
	hostKind: FoveaHostKind|string;
	hostName: string;
	methodName: string;
	decoratorContent: string;
}

export interface IOnlyLiteralValuesSupportedHereFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	kind: FoveaDiagnosticKind.ONLY_LITERAL_VALUES_SUPPORTED_HERE;
	hostKind: FoveaHostKind|string;
	hostName: string;
	decoratorContent: string;
}

export interface IInvalidHostAttributesDecoratorUsageFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	kind: FoveaDiagnosticKind.INVALID_HOST_ATTRIBUTES_DECORATOR_USAGE;
	hostKind: FoveaHostKind|string;
	hostName: string;
	decoratorContent: string;
}

export interface IInvalidVisibilityObserverDecoratorUsageFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	kind: FoveaDiagnosticKind.INVALID_VISIBILITY_OBSERVER_DECORATOR_USAGE;
	hostKind: FoveaHostKind|string;
	hostName: string;
	methodName: string;
	decoratorContent: string;
}

export interface IInvalidChildListObserverDecoratorUsageFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	kind: FoveaDiagnosticKind.INVALID_CHILD_LIST_OBSERVER_DECORATOR_USAGE;
	hostKind: FoveaHostKind|string;
	hostName: string;
	methodName: string;
	decoratorContent: string;
}

export interface IInvalidAttributeObserverDecoratorUsageFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	kind: FoveaDiagnosticKind.INVALID_ATTRIBUTE_OBSERVER_DECORATOR_USAGE;
	hostKind: FoveaHostKind|string;
	hostName: string;
	methodName: string;
	decoratorContent: string;
}

export interface IUnresolvedSrcFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	kind: FoveaDiagnosticKind.UNRESOLVED_SRC;
	hostKind: FoveaHostKind|string;
	hostName: string;
	decoratorContent: string;
	path: string;
}

export interface IInvalidSelectorNeedsHyphenFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	kind: FoveaDiagnosticKind.INVALID_SELECTOR_NEEDS_HYPHEN;
	hostKind: FoveaHostKind|string;
	hostName: string;
	decoratorContent: string;
	selector: string;
}

export interface IInvalidSelectorHasWhitespaceFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	kind: FoveaDiagnosticKind.INVALID_SELECTOR_HAS_WHITESPACE;
	hostKind: FoveaHostKind|string;
	hostName: string;
	decoratorContent: string;
	selector: string;
}

export interface IInvalidSelectorIsNotAllLowerCaseFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	kind: FoveaDiagnosticKind.INVALID_SELECTOR_IS_NOT_ALL_LOWER_CASE;
	hostKind: FoveaHostKind|string;
	hostName: string;
	decoratorContent: string;
	selector: string;
}

export interface IInvalidCssFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	kind: FoveaDiagnosticKind.INVALID_CSS;
	formattedErrorMessage: string;
}

export interface IInvalidTemplateFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	kind: FoveaDiagnosticKind.INVALID_TEMPLATE;
	formattedErrorMessage: string;
}

export declare type FoveaDiagnosticCtor =
	IUnknownSelectorFoveaDiagnosticCtor|
	IAmbiguousHostFoveaDiagnosticCtor|
	IInvalidSrcDecoratorUsageFoveaDiagnosticCtor|
	IInvalidDependsOnDecoratorUsageFoveaDiagnosticCtor|
	IInvalidSelectorDecoratorUsageFoveaDiagnosticCtor|
	IInvalidOnChangeDecoratorUsageFoveaDiagnosticCtor|
	IInvalidHostListenerDecoratorUsageFoveaDiagnosticCtor|
	IInvalidVisibilityObserverDecoratorUsageFoveaDiagnosticCtor|
	IInvalidChildListObserverDecoratorUsageFoveaDiagnosticCtor|
	IInvalidAttributeObserverDecoratorUsageFoveaDiagnosticCtor|
	IUnresolvedSrcFoveaDiagnosticCtor|
	IInvalidSelectorNeedsHyphenFoveaDiagnosticCtor|
	IInvalidSelectorHasWhitespaceFoveaDiagnosticCtor|
	IInvalidSelectorIsNotAllLowerCaseFoveaDiagnosticCtor|
	IInvalidCssFoveaDiagnosticCtor|
	IInvalidTemplateFoveaDiagnosticCtor|
	IInvalidHostAttributesDecoratorUsageFoveaDiagnosticCtor|
	IOnlyLiteralValuesSupportedHereFoveaDiagnosticCtor;