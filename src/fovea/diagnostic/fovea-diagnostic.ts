import {FoveaDiagnosticKind} from "./fovea-diagnostic-kind";
import {Diagnostic, DiagnosticCategory} from "typescript";

export interface IFoveaDiagnostic extends Diagnostic {
	code: FoveaDiagnosticKind;
	scope: string;
}

export interface IUnknownSelectorFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.UNKNOWN_SELECTOR;
	category: DiagnosticCategory.Warning;
}

export interface IAmbiguousHostFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.AMBIGUOUS_HOST;
	category: DiagnosticCategory.Error;
}

export interface ICustomElementMustExtendHtmlElementFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.CUSTOM_ELEMENT_MUST_EXTEND_HTML_ELEMENT;
	category: DiagnosticCategory.Error;
}

export interface IInvalidCustomElementDecoratorClassMustNotBeAbstractFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.INVALID_CUSTOM_ELEMENT_DECORATOR_CLASS_MUST_NOT_BE_ABSTRACT;
	category: DiagnosticCategory.Error;
}

export interface IInvalidCustomAttributeClassMustNotBeAbstractFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.INVALID_CUSTOM_ATTRIBUTE_DECORATOR_CLASS_MUST_NOT_BE_ABSTRACT;
	category: DiagnosticCategory.Error;
}

export interface IInvalidCustomElementDecoratorNotStaticallyAnalyzableFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.INVALID_CUSTOM_ELEMENT_DECORATOR_NOT_STATICALLY_ANALYZABLE;
	category: DiagnosticCategory.Error;
}

export interface IInvalidCustomElementDecoratorNotCalledFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.INVALID_CUSTOM_ELEMENT_DECORATOR_NOT_CALLED;
	category: DiagnosticCategory.Error;
}

export interface IInvalidCustomElementDecoratorFirstArgumentMustBeAStringFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.INVALID_CUSTOM_ELEMENT_DECORATOR_FIRST_ARGUMENT_MUST_BE_A_STRING;
	category: DiagnosticCategory.Error;
}

export interface IInvalidCustomElementDecoratorNoArgumentsFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.INVALID_CUSTOM_ELEMENT_DECORATOR_NO_ARGUMENTS;
	category: DiagnosticCategory.Error;
}

export interface IInvalidCustomElementDecoratorPlacementFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.INVALID_CUSTOM_ELEMENT_DECORATOR_PLACEMENT;
	category: DiagnosticCategory.Error;
}

export interface IInvalidCustomAttributeDecoratorNotStaticallyAnalyzableFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.INVALID_CUSTOM_ATTRIBUTE_DECORATOR_NOT_STATICALLY_ANALYZABLE;
	category: DiagnosticCategory.Error;
}

export interface IInvalidCustomAttributeDecoratorNotCalledFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.INVALID_CUSTOM_ATTRIBUTE_DECORATOR_NOT_CALLED;
	category: DiagnosticCategory.Error;
}

export interface IInvalidCustomAttributeDecoratorNoArgumentsFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.INVALID_CUSTOM_ATTRIBUTE_DECORATOR_NO_ARGUMENTS;
	category: DiagnosticCategory.Error;
}

export interface IInvalidCustomAttributeDecoratorFirstArgumentMustBeAStringFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.INVALID_CUSTOM_ATTRIBUTE_DECORATOR_FIRST_ARGUMENT_MUST_BE_A_STRING;
	category: DiagnosticCategory.Error;
}

export interface IInvalidCustomAttributeDecoratorPlacementFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.INVALID_CUSTOM_ATTRIBUTE_DECORATOR_PLACEMENT;
	category: DiagnosticCategory.Error;
}

export interface IInvalidStyleSrcDecoratorUsageFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.INVALID_STYLE_SRC_DECORATOR_USAGE;
	category: DiagnosticCategory.Error;
}

export interface IInvalidTemplateSrcDecoratorUsageFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.INVALID_TEMPLATE_SRC_DECORATOR_USAGE;
	category: DiagnosticCategory.Error;
}

export interface IInvalidDependsOnDecoratorUsageFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.INVALID_DEPENDS_ON_DECORATOR_USAGE;
	category: DiagnosticCategory.Error;
}

export interface IInvalidOnChangeDecoratorUsageFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.INVALID_ON_CHANGE_DECORATOR_USAGE;
	category: DiagnosticCategory.Error;
}

export interface IInvalidListenerDecoratorUsageFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.INVALID_LISTENER_DECORATOR_USAGE;
	category: DiagnosticCategory.Error;
}

export interface IInvalidHostAttributesDecoratorUsageFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.INVALID_HOST_ATTRIBUTES_DECORATOR_USAGE;
	category: DiagnosticCategory.Error;
}

export interface IInvalidVisibilityObserverDecoratorUsageFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.INVALID_VISIBILITY_OBSERVER_DECORATOR_USAGE;
	category: DiagnosticCategory.Error;
}

export interface IInvalidChildListObserverDecoratorUsageFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.INVALID_CHILD_LIST_OBSERVER_DECORATOR_USAGE;
	category: DiagnosticCategory.Error;
}

export interface IInvalidAttributeObserverDecoratorUsageFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.INVALID_ATTRIBUTE_OBSERVER_DECORATOR_USAGE;
	category: DiagnosticCategory.Error;
}

export interface IUnresolvedStyleSrcFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.UNRESOLVED_STYLE_SRC;
	category: DiagnosticCategory.Error;
}

export interface IUnresolvedTemplateSrcFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.UNRESOLVED_TEMPLATE_SRC;
	category: DiagnosticCategory.Error;
}

export interface IInvalidSelectorNeedsHyphenFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.INVALID_SELECTOR_NEEDS_HYPHEN;
	category: DiagnosticCategory.Error;
}

export interface IInvalidSelectorHasWhitespaceFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.INVALID_SELECTOR_HAS_WHITESPACE;
	category: DiagnosticCategory.Error;
}

export interface IInvalidSelectorIsNotAllLowerCaseFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.INVALID_SELECTOR_IS_NOT_ALL_LOWER_CASE;
	category: DiagnosticCategory.Error;
}

export interface IOnlyLiteralValuesSupportedHereFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.ONLY_LITERAL_VALUES_SUPPORTED_HERE;
	category: DiagnosticCategory.Error;
}

export interface IInvalidCssFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.INVALID_CSS;
	category: DiagnosticCategory.Error;
}

export interface IInvalidTemplateFoveaDiagnostic extends IFoveaDiagnostic {
	code: FoveaDiagnosticKind.INVALID_TEMPLATE;
	category: DiagnosticCategory.Error;
}

export declare type FoveaDiagnostic =
	IUnknownSelectorFoveaDiagnostic|
	IAmbiguousHostFoveaDiagnostic|
	ICustomElementMustExtendHtmlElementFoveaDiagnostic|
	IInvalidCustomElementDecoratorClassMustNotBeAbstractFoveaDiagnostic|
	IInvalidCustomAttributeClassMustNotBeAbstractFoveaDiagnostic|
	IInvalidCustomElementDecoratorNotStaticallyAnalyzableFoveaDiagnostic|
	IInvalidCustomElementDecoratorNotCalledFoveaDiagnostic|
	IInvalidCustomElementDecoratorFirstArgumentMustBeAStringFoveaDiagnostic|
	IInvalidCustomElementDecoratorNoArgumentsFoveaDiagnostic|
	IInvalidCustomElementDecoratorPlacementFoveaDiagnostic|
	IInvalidCustomAttributeDecoratorNotStaticallyAnalyzableFoveaDiagnostic|
	IInvalidCustomAttributeDecoratorNotCalledFoveaDiagnostic|
	IInvalidCustomAttributeDecoratorNoArgumentsFoveaDiagnostic|
	IInvalidCustomAttributeDecoratorFirstArgumentMustBeAStringFoveaDiagnostic|
	IInvalidCustomAttributeDecoratorPlacementFoveaDiagnostic|
	IInvalidStyleSrcDecoratorUsageFoveaDiagnostic|
	IInvalidTemplateSrcDecoratorUsageFoveaDiagnostic|
	IInvalidDependsOnDecoratorUsageFoveaDiagnostic|
	IInvalidOnChangeDecoratorUsageFoveaDiagnostic|
	IInvalidListenerDecoratorUsageFoveaDiagnostic|
	IInvalidVisibilityObserverDecoratorUsageFoveaDiagnostic|
	IInvalidChildListObserverDecoratorUsageFoveaDiagnostic|
	IInvalidAttributeObserverDecoratorUsageFoveaDiagnostic|
	IUnresolvedStyleSrcFoveaDiagnostic|
	IUnresolvedTemplateSrcFoveaDiagnostic|
	IInvalidSelectorNeedsHyphenFoveaDiagnostic|
	IInvalidSelectorHasWhitespaceFoveaDiagnostic|
	IInvalidSelectorIsNotAllLowerCaseFoveaDiagnostic|
	IInvalidCssFoveaDiagnostic|
	IInvalidTemplateFoveaDiagnostic|
	IInvalidHostAttributesDecoratorUsageFoveaDiagnostic|
	IOnlyLiteralValuesSupportedHereFoveaDiagnostic;