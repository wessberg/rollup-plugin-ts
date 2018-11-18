import {FoveaDiagnosticKind} from "./fovea-diagnostic-kind";
import {FoveaHostKind} from "@fovea/common";
import {FoveaDecoratorName} from "../constant/constant";
import {SourceFile, SyntaxKind} from "typescript";

export interface IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind;
	file: SourceFile;
	start: number|undefined;
	length: number|undefined;
}

export interface IUnknownSelectorFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.UNKNOWN_SELECTOR;
	hostKind: FoveaHostKind|string;
	selector: string;
	hostName: string|undefined;
}

export interface IAmbiguousHostFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.AMBIGUOUS_HOST;
	hostName: string|undefined;
}

export interface ICustomElementMustExtendHtmlElementFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.CUSTOM_ELEMENT_MUST_EXTEND_HTML_ELEMENT;
	hostName: string|undefined;
}

export interface IInvalidCustomElementDecoratorClassMustNotBeAbstractFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.INVALID_CUSTOM_ELEMENT_DECORATOR_CLASS_MUST_NOT_BE_ABSTRACT;
	hostName: string|undefined;
}

export interface IInvalidCustomAttributeDecoratorClassMustNotBeAbstractFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.INVALID_CUSTOM_ATTRIBUTE_DECORATOR_CLASS_MUST_NOT_BE_ABSTRACT;
	hostName: string|undefined;
}

export interface IInvalidCustomElementDecoratorNotStaticallyAnalyzableFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.INVALID_CUSTOM_ELEMENT_DECORATOR_NOT_STATICALLY_ANALYZABLE;
	hostName: string|undefined;
}

export interface IInvalidCustomElementDecoratorNotCalledFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.INVALID_CUSTOM_ELEMENT_DECORATOR_NOT_CALLED;
	hostName: string|undefined;
}

export interface IInvalidCustomElementDecoratorNoArgumentsFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.INVALID_CUSTOM_ELEMENT_DECORATOR_NO_ARGUMENTS;
	hostName: string|undefined;
}

export interface IInvalidCustomElementDecoratorFirstArgumentMustBeAStringFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.INVALID_CUSTOM_ELEMENT_DECORATOR_FIRST_ARGUMENT_MUST_BE_A_STRING;
	hostName: string|undefined;
}

export interface IInvalidCustomElementDecoratorPlacementFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.INVALID_CUSTOM_ELEMENT_DECORATOR_PLACEMENT;
	placement: SyntaxKind;
}

export interface IInvalidCustomAttributeDecoratorNotStaticallyAnalyzableFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.INVALID_CUSTOM_ATTRIBUTE_DECORATOR_NOT_STATICALLY_ANALYZABLE;
	hostName: string|undefined;
}

export interface IInvalidCustomAttributeDecoratorNotCalledFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.INVALID_CUSTOM_ATTRIBUTE_DECORATOR_NOT_CALLED;
	hostName: string|undefined;
}

export interface IInvalidCustomAttributeDecoratorNoArgumentsFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.INVALID_CUSTOM_ATTRIBUTE_DECORATOR_NO_ARGUMENTS;
	hostName: string|undefined;
}

export interface IInvalidCustomAttributeDecoratorFirstArgumentMustBeAStringFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.INVALID_CUSTOM_ATTRIBUTE_DECORATOR_FIRST_ARGUMENT_MUST_BE_A_STRING;
	hostName: string|undefined;
}

export interface IInvalidCustomAttributeDecoratorPlacementFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.INVALID_CUSTOM_ATTRIBUTE_DECORATOR_PLACEMENT;
	placement: SyntaxKind;
}

export interface IInvalidStyleSrcDecoratorUsageFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.INVALID_STYLE_SRC_DECORATOR_USAGE;
	hostKind: FoveaHostKind|string;
	hostName: string|undefined;
}

export interface IInvalidTemplateSrcDecoratorUsageFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.INVALID_TEMPLATE_SRC_DECORATOR_USAGE;
	hostKind: FoveaHostKind|string;
	hostName: string|undefined;
}

export interface IInvalidDependsOnDecoratorUsageFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.INVALID_DEPENDS_ON_DECORATOR_USAGE;
	hostKind: FoveaHostKind|string;
	hostName: string|undefined;
}

export interface IInvalidOnChangeDecoratorUsageFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.INVALID_ON_CHANGE_DECORATOR_USAGE;
	hostKind: FoveaHostKind|string;
	hostName: string|undefined;
	methodName: string;
}

export interface IInvalidListenerDecoratorUsageFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.INVALID_LISTENER_DECORATOR_USAGE;
	hostKind: FoveaHostKind|string;
	hostName: string|undefined;
	methodName: string;
}

export interface IOnlyLiteralValuesSupportedHereFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.ONLY_LITERAL_VALUES_SUPPORTED_HERE;
	hostKind: FoveaHostKind|string;
	hostName: string|undefined;
	content: string;
}

export interface IInvalidHostAttributesDecoratorUsageFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.INVALID_HOST_ATTRIBUTES_DECORATOR_USAGE;
	hostKind: FoveaHostKind|string;
	hostName: string|undefined;
}

export interface IInvalidVisibilityObserverDecoratorUsageFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.INVALID_VISIBILITY_OBSERVER_DECORATOR_USAGE;
	hostKind: FoveaHostKind|string;
	hostName: string|undefined;
	methodName: string;
	decoratorName: FoveaDecoratorName;
}

export interface IInvalidChildListObserverDecoratorUsageFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.INVALID_CHILD_LIST_OBSERVER_DECORATOR_USAGE;
	hostKind: FoveaHostKind|string;
	hostName: string|undefined;
	methodName: string;
	decoratorName: FoveaDecoratorName;
}

export interface IInvalidAttributeObserverDecoratorUsageFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.INVALID_ATTRIBUTE_OBSERVER_DECORATOR_USAGE;
	hostKind: FoveaHostKind|string;
	hostName: string|undefined;
	methodName: string;
}

export interface IUnresolvedStyleSrcFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.UNRESOLVED_STYLE_SRC;
	hostKind: FoveaHostKind|string;
	hostName: string|undefined;
	path: string;
}

export interface IUnresolvedTemplateSrcFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.UNRESOLVED_TEMPLATE_SRC;
	hostKind: FoveaHostKind|string;
	hostName: string|undefined;
	path: string;
}

export interface IInvalidSelectorNeedsHyphenFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.INVALID_SELECTOR_NEEDS_HYPHEN;
	hostKind: FoveaHostKind|string;
	hostName: string|undefined;
	selector: string;
}

export interface IInvalidSelectorHasWhitespaceFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.INVALID_SELECTOR_HAS_WHITESPACE;
	hostKind: FoveaHostKind|string;
	hostName: string|undefined;
	selector: string;
}

export interface IInvalidSelectorIsNotAllLowerCaseFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.INVALID_SELECTOR_IS_NOT_ALL_LOWER_CASE;
	hostKind: FoveaHostKind|string;
	hostName: string|undefined;
	selector: string;
}

export interface IInvalidCssFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.INVALID_CSS;
	formattedErrorMessage: string;
}

export interface IInvalidTemplateFoveaDiagnosticCtor extends IFoveaDiagnosticCtor {
	code: FoveaDiagnosticKind.INVALID_TEMPLATE;
	formattedErrorMessage: string;
}

export declare type FoveaDiagnosticCtor =
	IUnknownSelectorFoveaDiagnosticCtor|
	IAmbiguousHostFoveaDiagnosticCtor|
	ICustomElementMustExtendHtmlElementFoveaDiagnosticCtor|
	IInvalidCustomElementDecoratorClassMustNotBeAbstractFoveaDiagnosticCtor|
	IInvalidCustomAttributeDecoratorClassMustNotBeAbstractFoveaDiagnosticCtor|
	IInvalidCustomElementDecoratorNotStaticallyAnalyzableFoveaDiagnosticCtor|
	IInvalidCustomElementDecoratorNotCalledFoveaDiagnosticCtor|
	IInvalidCustomElementDecoratorNoArgumentsFoveaDiagnosticCtor|
	IInvalidCustomElementDecoratorFirstArgumentMustBeAStringFoveaDiagnosticCtor|
	IInvalidCustomElementDecoratorPlacementFoveaDiagnosticCtor|
	IInvalidCustomAttributeDecoratorNotStaticallyAnalyzableFoveaDiagnosticCtor|
	IInvalidCustomAttributeDecoratorNotCalledFoveaDiagnosticCtor|
	IInvalidCustomAttributeDecoratorNoArgumentsFoveaDiagnosticCtor|
	IInvalidCustomAttributeDecoratorFirstArgumentMustBeAStringFoveaDiagnosticCtor|
	IInvalidCustomAttributeDecoratorPlacementFoveaDiagnosticCtor|
	IInvalidStyleSrcDecoratorUsageFoveaDiagnosticCtor|
	IInvalidTemplateSrcDecoratorUsageFoveaDiagnosticCtor|
	IInvalidDependsOnDecoratorUsageFoveaDiagnosticCtor|
	IInvalidOnChangeDecoratorUsageFoveaDiagnosticCtor|
	IInvalidListenerDecoratorUsageFoveaDiagnosticCtor|
	IInvalidVisibilityObserverDecoratorUsageFoveaDiagnosticCtor|
	IInvalidChildListObserverDecoratorUsageFoveaDiagnosticCtor|
	IInvalidAttributeObserverDecoratorUsageFoveaDiagnosticCtor|
	IUnresolvedStyleSrcFoveaDiagnosticCtor|
	IUnresolvedTemplateSrcFoveaDiagnosticCtor|
	IInvalidSelectorNeedsHyphenFoveaDiagnosticCtor|
	IInvalidSelectorHasWhitespaceFoveaDiagnosticCtor|
	IInvalidSelectorIsNotAllLowerCaseFoveaDiagnosticCtor|
	IInvalidCssFoveaDiagnosticCtor|
	IInvalidTemplateFoveaDiagnosticCtor|
	IInvalidHostAttributesDecoratorUsageFoveaDiagnosticCtor|
	IOnlyLiteralValuesSupportedHereFoveaDiagnosticCtor;