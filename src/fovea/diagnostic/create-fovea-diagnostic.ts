import {
	FoveaDiagnosticCtor, IAmbiguousHostFoveaDiagnosticCtor, IInvalidCustomAttributeDecoratorClassMustNotBeAbstractFoveaDiagnosticCtor, ICustomElementMustExtendHtmlElementFoveaDiagnosticCtor, IInvalidCustomElementDecoratorClassMustNotBeAbstractFoveaDiagnosticCtor, IInvalidAttributeObserverDecoratorUsageFoveaDiagnosticCtor, IInvalidChildListObserverDecoratorUsageFoveaDiagnosticCtor, IInvalidCssFoveaDiagnosticCtor, IInvalidCustomAttributeDecoratorNoArgumentsFoveaDiagnosticCtor, IInvalidCustomAttributeDecoratorNotCalledFoveaDiagnosticCtor, IInvalidCustomAttributeDecoratorNotStaticallyAnalyzableFoveaDiagnosticCtor, IInvalidCustomAttributeDecoratorPlacementFoveaDiagnosticCtor, IInvalidCustomElementDecoratorNoArgumentsFoveaDiagnosticCtor, IInvalidCustomElementDecoratorNotCalledFoveaDiagnosticCtor, IInvalidCustomElementDecoratorNotStaticallyAnalyzableFoveaDiagnosticCtor, IInvalidCustomElementDecoratorPlacementFoveaDiagnosticCtor, IInvalidDependsOnDecoratorUsageFoveaDiagnosticCtor, IInvalidHostAttributesDecoratorUsageFoveaDiagnosticCtor, IInvalidListenerDecoratorUsageFoveaDiagnosticCtor, IInvalidOnChangeDecoratorUsageFoveaDiagnosticCtor, IInvalidSelectorHasWhitespaceFoveaDiagnosticCtor, IInvalidSelectorIsNotAllLowerCaseFoveaDiagnosticCtor, IInvalidSelectorNeedsHyphenFoveaDiagnosticCtor, IInvalidStyleSrcDecoratorUsageFoveaDiagnosticCtor, IInvalidTemplateFoveaDiagnosticCtor, IInvalidTemplateSrcDecoratorUsageFoveaDiagnosticCtor, IInvalidVisibilityObserverDecoratorUsageFoveaDiagnosticCtor, IOnlyLiteralValuesSupportedHereFoveaDiagnosticCtor, IUnknownSelectorFoveaDiagnosticCtor, IUnresolvedStyleSrcFoveaDiagnosticCtor, IUnresolvedTemplateSrcFoveaDiagnosticCtor, IInvalidCustomElementDecoratorFirstArgumentMustBeAStringFoveaDiagnosticCtor, IInvalidCustomAttributeDecoratorFirstArgumentMustBeAStringFoveaDiagnosticCtor
} from "./fovea-diagnostic-ctor";
import {FoveaDiagnosticKind} from "./fovea-diagnostic-kind";
import {paintDecorator, paintError, paintFunction, paintHost, paintMetadata, paintSelector} from "./paint";
import {stringifyHostKind} from "./serialize";
import {
	FoveaDiagnostic, IAmbiguousHostFoveaDiagnostic, IInvalidCustomAttributeClassMustNotBeAbstractFoveaDiagnostic, ICustomElementMustExtendHtmlElementFoveaDiagnostic, IInvalidCustomElementDecoratorClassMustNotBeAbstractFoveaDiagnostic, IInvalidAttributeObserverDecoratorUsageFoveaDiagnostic, IInvalidChildListObserverDecoratorUsageFoveaDiagnostic, IInvalidCssFoveaDiagnostic, IInvalidCustomAttributeDecoratorNoArgumentsFoveaDiagnostic, IInvalidCustomAttributeDecoratorNotCalledFoveaDiagnostic, IInvalidCustomAttributeDecoratorNotStaticallyAnalyzableFoveaDiagnostic, IInvalidCustomAttributeDecoratorPlacementFoveaDiagnostic, IInvalidCustomElementDecoratorNoArgumentsFoveaDiagnostic, IInvalidCustomElementDecoratorNotCalledFoveaDiagnostic, IInvalidCustomElementDecoratorNotStaticallyAnalyzableFoveaDiagnostic, IInvalidCustomElementDecoratorPlacementFoveaDiagnostic, IInvalidDependsOnDecoratorUsageFoveaDiagnostic, IInvalidHostAttributesDecoratorUsageFoveaDiagnostic, IInvalidListenerDecoratorUsageFoveaDiagnostic, IInvalidOnChangeDecoratorUsageFoveaDiagnostic, IInvalidSelectorHasWhitespaceFoveaDiagnostic, IInvalidSelectorIsNotAllLowerCaseFoveaDiagnostic, IInvalidSelectorNeedsHyphenFoveaDiagnostic, IInvalidStyleSrcDecoratorUsageFoveaDiagnostic, IInvalidTemplateFoveaDiagnostic, IInvalidTemplateSrcDecoratorUsageFoveaDiagnostic, IInvalidVisibilityObserverDecoratorUsageFoveaDiagnostic, IOnlyLiteralValuesSupportedHereFoveaDiagnostic, IUnknownSelectorFoveaDiagnostic, IUnresolvedStyleSrcFoveaDiagnostic, IUnresolvedTemplateSrcFoveaDiagnostic, IInvalidCustomElementDecoratorFirstArgumentMustBeAStringFoveaDiagnostic, IInvalidCustomAttributeDecoratorFirstArgumentMustBeAStringFoveaDiagnostic
} from "./fovea-diagnostic";
import {NAME} from "../constant/constant";
import {computeSelectorNameFromClassName} from "../walker/util/class/compute-selector-name-from-class-name/compute-selector-name-from-class-name";
import {syntaxKindToHumanText} from "../walker/util/syntax-kind/syntax-kind-to-human-text/syntax-kind-to-human-text";
import {DiagnosticCategory, SyntaxKind} from "typescript";

/**
 * Creates a diagnostic for the given file based on the given options
 * @param {FoveaDiagnosticCtor} diagnostic
 */
export function createFoveaDiagnostic (diagnostic: FoveaDiagnosticCtor): FoveaDiagnostic {
	switch (diagnostic.code) {
		case FoveaDiagnosticKind.UNKNOWN_SELECTOR:
			return createUnknownSelectorDiagnostic(diagnostic);

		case FoveaDiagnosticKind.AMBIGUOUS_HOST:
			return createAmbiguousHostDiagnostic(diagnostic);

		case FoveaDiagnosticKind.CUSTOM_ELEMENT_MUST_EXTEND_HTML_ELEMENT:
			return createCustomElementMustExtendHtmlElementDiagnostic(diagnostic);

		case FoveaDiagnosticKind.INVALID_CUSTOM_ELEMENT_DECORATOR_CLASS_MUST_NOT_BE_ABSTRACT:
			return createInvalidCustomElementDecoratorClassMustNotBeAbstractDiagnostic(diagnostic);

		case FoveaDiagnosticKind.INVALID_CUSTOM_ATTRIBUTE_DECORATOR_CLASS_MUST_NOT_BE_ABSTRACT:
			return createInvalidCustomAttributeDecoratorClassMustNotBeAbstractDiagnostic(diagnostic);

		case FoveaDiagnosticKind.INVALID_CUSTOM_ELEMENT_DECORATOR_NOT_STATICALLY_ANALYZABLE:
			return createInvalidCustomElementDecoratorNotStaticallyAnalyzableDiagnostic(diagnostic);

		case FoveaDiagnosticKind.INVALID_CUSTOM_ELEMENT_DECORATOR_NOT_CALLED:
			return createInvalidCustomElementDecoratorNotCalledDiagnostic(diagnostic);

		case FoveaDiagnosticKind.INVALID_CUSTOM_ELEMENT_DECORATOR_NO_ARGUMENTS:
			return createInvalidCustomElementDecoratorNoArgumentsDiagnostic(diagnostic);

		case FoveaDiagnosticKind.INVALID_CUSTOM_ELEMENT_DECORATOR_FIRST_ARGUMENT_MUST_BE_A_STRING:
			return createInvalidCustomElementDecoratorFirstArgumentMustBeAStringDiagnostic(diagnostic);

		case FoveaDiagnosticKind.INVALID_CUSTOM_ELEMENT_DECORATOR_PLACEMENT:
			return createInvalidCustomElementDecoratorPlacementDiagnostic(diagnostic);

		case FoveaDiagnosticKind.INVALID_CUSTOM_ATTRIBUTE_DECORATOR_NOT_STATICALLY_ANALYZABLE:
			return createInvalidCustomAttributeDecoratorNotStaticallyAnalyzableDiagnostic(diagnostic);

		case FoveaDiagnosticKind.INVALID_CUSTOM_ATTRIBUTE_DECORATOR_NOT_CALLED:
			return createInvalidCustomAttributeDecoratorNotCalledDiagnostic(diagnostic);

		case FoveaDiagnosticKind.INVALID_CUSTOM_ATTRIBUTE_DECORATOR_FIRST_ARGUMENT_MUST_BE_A_STRING:
			return createInvalidCustomAttributeDecoratorFirstArgumentMustBeAStringDiagnostic(diagnostic);

		case FoveaDiagnosticKind.INVALID_CUSTOM_ATTRIBUTE_DECORATOR_NO_ARGUMENTS:
			return createInvalidCustomAttributeDecoratorNoArgumentsDiagnostic(diagnostic);

		case FoveaDiagnosticKind.INVALID_CUSTOM_ATTRIBUTE_DECORATOR_PLACEMENT:
			return createInvalidCustomAttributeDecoratorPlacementDiagnostic(diagnostic);

		case FoveaDiagnosticKind.INVALID_STYLE_SRC_DECORATOR_USAGE:
			return createInvalidStyleSrcDecoratorUsageDiagnostic(diagnostic);

		case FoveaDiagnosticKind.INVALID_TEMPLATE_SRC_DECORATOR_USAGE:
			return createInvalidTemplateSrcDecoratorUsageDiagnostic(diagnostic);

		case FoveaDiagnosticKind.INVALID_DEPENDS_ON_DECORATOR_USAGE:
			return createInvalidDependsOnDecoratorUsageDiagnostic(diagnostic);

		case FoveaDiagnosticKind.INVALID_ON_CHANGE_DECORATOR_USAGE:
			return createInvalidOnChangeDecoratorUsageDiagnostic(diagnostic);

		case FoveaDiagnosticKind.INVALID_LISTENER_DECORATOR_USAGE:
			return createInvalidListenerDecoratorUsageDiagnostic(diagnostic);

		case FoveaDiagnosticKind.INVALID_VISIBILITY_OBSERVER_DECORATOR_USAGE:
			return createInvalidVisibilityObserverDecoratorUsageDiagnostic(diagnostic);

		case FoveaDiagnosticKind.INVALID_CHILD_LIST_OBSERVER_DECORATOR_USAGE:
			return createInvalidChildListObserverDecoratorUsageDiagnostic(diagnostic);

		case FoveaDiagnosticKind.INVALID_ATTRIBUTE_OBSERVER_DECORATOR_USAGE:
			return createInvalidAttributeObserverDecoratorUsageDiagnostic(diagnostic);

		case FoveaDiagnosticKind.UNRESOLVED_STYLE_SRC:
			return createUnresolvedStyleSrcDiagnostic(diagnostic);

		case FoveaDiagnosticKind.UNRESOLVED_TEMPLATE_SRC:
			return createUnresolvedTemplateSrcDiagnostic(diagnostic);

		case FoveaDiagnosticKind.INVALID_SELECTOR_NEEDS_HYPHEN:
			return createInvalidSelectorNeedsHyphenDiagnostic(diagnostic);

		case FoveaDiagnosticKind.INVALID_SELECTOR_HAS_WHITESPACE:
			return createInvalidSelectorHasWhitespaceDiagnostic(diagnostic);

		case FoveaDiagnosticKind.INVALID_SELECTOR_IS_NOT_ALL_LOWER_CASE:
			return createInvalidSelectorIsNotAllLowerCaseDiagnostic(diagnostic);

		case FoveaDiagnosticKind.INVALID_CSS:
			return createInvalidCssDiagnostic(diagnostic);

		case FoveaDiagnosticKind.INVALID_TEMPLATE:
			return createInvalidTemplateDiagnostic(diagnostic);

		case FoveaDiagnosticKind.INVALID_HOST_ATTRIBUTES_DECORATOR_USAGE:
			return createInvalidHostAttributesDecoratorUsageDiagnostic(diagnostic);

		case FoveaDiagnosticKind.ONLY_LITERAL_VALUES_SUPPORTED_HERE:
			return createOnlyLiteralValuesSupportedHereDiagnostic(diagnostic);
	}
}

/**
 * Creates a diagnostic for a reference to an unknown selector within a template for a component.
 * This is usually due to the wrong selector being used or the file containing the selector not
 * being imported prior to using it
 * @param {IUnknownSelectorFoveaDiagnosticCtor} diagnostic
 * @returns {IUnknownSelectorFoveaDiagnostic}
 */
function createUnknownSelectorDiagnostic ({code, hostName, selector, hostKind, file, length, start}: IUnknownSelectorFoveaDiagnosticCtor): IUnknownSelectorFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Warning,
		code,
		file,
		messageText: `You depend on the ${stringifyHostKind(hostKind)} with selector: '${paintSelector(selector)}' within the template for ${hostName == null ? `a component` : `the component '${paintHost(hostName)}'`}, but no ${stringifyHostKind(hostKind)} with that selector could be resolved`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for a invalid CSS contents. This will be the case if PostCSS of node-sass determines
 * a semantic or syntactical error.
 * @param {IInvalidCssFoveaDiagnosticCtor} diagnostic
 * @returns {IInvalidCssFoveaDiagnostic}
 */
function createInvalidCssDiagnostic ({code, formattedErrorMessage, start, length, file}: IInvalidCssFoveaDiagnosticCtor): IInvalidCssFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `The styles provided in file: '${file}' is invalid. Here's the full error message:\n. ${paintError(formattedErrorMessage)}`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for a invalid Template contents. This will be the case if @fovea/dom discovers a semantic or syntactical error.
 * @param {IInvalidTemplateFoveaDiagnosticCtor} diagnostic
 * @returns {IInvalidTemplateFoveaDiagnostic}
 */
function createInvalidTemplateDiagnostic ({code, formattedErrorMessage, file, length, start}: IInvalidTemplateFoveaDiagnosticCtor): IInvalidTemplateFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `The template provided in file: '${file}' is invalid. Here's the full error message:\n. ${paintError(formattedErrorMessage)}`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for a class that both extends HTMLElement (directly or by inheritance) *AND* is decorated with the @customAttribute decorator (and thus is a custom attribute).
 * In this case, Fovea doesn't know whether to treat it as a component or a custom attribute and should fail for that file.
 * @param {IAmbiguousHostFoveaDiagnosticCtor} diagnostic
 * @returns {IAmbiguousHostFoveaDiagnosticCtor}
 */
function createAmbiguousHostDiagnostic ({code, hostName, length, start, file}: IAmbiguousHostFoveaDiagnosticCtor): IAmbiguousHostFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `You provided a class${hostName == null ? "" : `, '${paintHost(hostName)}',`} that is both annotated with the '${paintDecorator(NAME.host.member.preCompile.decorator.customElement)} decorator' AND the '${paintDecorator(NAME.host.member.preCompile.decorator.customAttribute)} decorator'. You must either define a Custom Element or a Custom Attribute, but you cannot do both at the same time. Please remove one of them`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for a class that has a @customElement("<selector>") decorator, but doesn't directly or indirectly inherit from HTMLElement
 * @param {ICustomElementMustExtendHtmlElementFoveaDiagnosticCtor} diagnostic
 * @returns {ICustomElementMustExtendHtmlElementFoveaDiagnostic}
 */
function createCustomElementMustExtendHtmlElementDiagnostic ({code, hostName, file, start, length}: ICustomElementMustExtendHtmlElementFoveaDiagnosticCtor): ICustomElementMustExtendHtmlElementFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `You provided a class${hostName == null ? "" : `, '${paintHost(hostName)}',`} that is annotated with the '${paintDecorator(NAME.host.member.preCompile.decorator.customElement)} decorator', but it doesn't seem to inherit directly or indirectly from HTMLElement. Please either extend HTMLElement or another class that extends from it.`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for a class that has a @customElement("<selector>") decorator, but is abstract.
 * Only non-abstract classes can be instantiated.
 * @param {IInvalidCustomElementDecoratorClassMustNotBeAbstractFoveaDiagnosticCtor} diagnostic
 * @returns {IInvalidCustomElementDecoratorClassMustNotBeAbstractFoveaDiagnostic}
 */
function createInvalidCustomElementDecoratorClassMustNotBeAbstractDiagnostic ({code, hostName, length, start, file}: IInvalidCustomElementDecoratorClassMustNotBeAbstractFoveaDiagnosticCtor): IInvalidCustomElementDecoratorClassMustNotBeAbstractFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `You provided a class${hostName == null ? "" : `, '${paintHost(hostName)}',`} that is annotated with the '${paintDecorator(NAME.host.member.preCompile.decorator.customElement)}' decorator, but it is marked as an abstract class. Only non-abstract classes can be instantiated and stamped into the DOM`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for a class that has a @customAttribute("<selector>") decorator, but is abstract.
 * Only non-abstract classes can be instantiated.
 * @param {IInvalidCustomAttributeDecoratorClassMustNotBeAbstractFoveaDiagnosticCtor} diagnostic
 * @returns {IInvalidCustomAttributeClassMustNotBeAbstractFoveaDiagnostic}
 */
function createInvalidCustomAttributeDecoratorClassMustNotBeAbstractDiagnostic ({code, hostName, file, start, length}: IInvalidCustomAttributeDecoratorClassMustNotBeAbstractFoveaDiagnosticCtor): IInvalidCustomAttributeClassMustNotBeAbstractFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `You provided a class${hostName == null ? "" : `, '${paintHost(hostName)}',`} that is annotated with the '${paintDecorator(NAME.host.member.preCompile.decorator.customAttribute)}' decorator, but it is marked as an abstract class. Only non-abstract classes can be instantiated.`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for a class that has a @customElement decorator, but the arguments it is given aren't statically analyzable
 * @param {IInvalidCustomElementDecoratorNotStaticallyAnalyzableFoveaDiagnosticCtor} diagnostic
 * @returns {IInvalidCustomElementDecoratorNotStaticallyAnalyzableFoveaDiagnostic}
 */
function createInvalidCustomElementDecoratorNotStaticallyAnalyzableDiagnostic ({code, hostName, length, start, file}: IInvalidCustomElementDecoratorNotStaticallyAnalyzableFoveaDiagnosticCtor): IInvalidCustomElementDecoratorNotStaticallyAnalyzableFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `You provided a class${hostName == null ? "" : `, '${paintHost(hostName)}',`} that is annotated with the decorator: '${paintDecorator(`@${NAME.host.member.preCompile.decorator.customElement}`)}', but the selector it received as an argument wasn't statically analyzable. You must provide a literal value as an argument. For example: ${paintDecorator(`@${NAME.host.member.preCompile.decorator.customElement}("${computeSelectorNameFromClassName(hostName)}")`)}`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for a class that has a @customElement decorator, but it isn't a CallExpression (e.g. it isn't invoked)
 * @param {IInvalidCustomElementDecoratorNotCalledFoveaDiagnosticCtor} diagnostic
 * @returns {IInvalidCustomElementDecoratorNotCalledFoveaDiagnostic}
 */
function createInvalidCustomElementDecoratorNotCalledDiagnostic ({code, hostName, file, start, length}: IInvalidCustomElementDecoratorNotCalledFoveaDiagnosticCtor): IInvalidCustomElementDecoratorNotCalledFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `You provided a class${hostName == null ? "" : `, '${paintHost(hostName)}',`} that is annotated with the decorator: '${paintDecorator(`@${NAME.host.member.preCompile.decorator.customElement}`)}', but it wasn't invoked. You must invoke the decorator and provide it with a selector name as an argument. For example: ${paintDecorator(`@${NAME.host.member.preCompile.decorator.customElement}("${computeSelectorNameFromClassName(hostName)}")`)}`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for a class that has a @customElement decorator, but it doesn't receive any arguments
 * @param {IInvalidCustomElementDecoratorNoArgumentsFoveaDiagnosticCtor} diagnostic
 * @returns {IInvalidCustomElementDecoratorNoArgumentsFoveaDiagnostic}
 */
function createInvalidCustomElementDecoratorNoArgumentsDiagnostic ({code, hostName, length, start, file}: IInvalidCustomElementDecoratorNoArgumentsFoveaDiagnosticCtor): IInvalidCustomElementDecoratorNoArgumentsFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `You provided a class${hostName == null ? "" : `, '${paintHost(hostName)}',`} that is annotated with the decorator: '${paintDecorator(`@${NAME.host.member.preCompile.decorator.customElement}`)}', but you didn't provide it with any arguments. You must provide it with a selector name as an argument. For example: ${paintDecorator(`@${NAME.host.member.preCompile.decorator.customElement}("${computeSelectorNameFromClassName(hostName)}")`)}`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for when a @customElement decorator annotates anything else than a class
 * @param {IInvalidCustomElementDecoratorPlacementFoveaDiagnosticCtor} diagnostic
 * @returns {IInvalidCustomElementDecoratorPlacementFoveaDiagnostic}
 */
function createInvalidCustomElementDecoratorPlacementDiagnostic ({placement, start, file, length, code}: IInvalidCustomElementDecoratorPlacementFoveaDiagnosticCtor): IInvalidCustomElementDecoratorPlacementFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `You have annotated a ${syntaxKindToHumanText(placement)} with the decorator: '${paintDecorator(`@${NAME.host.member.preCompile.decorator.customElement}`)}', but that decorator must only annotate ${syntaxKindToHumanText(SyntaxKind.ClassDeclaration, true)}`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for a class that has a @customElement decorator, but the first argument it receives isn't a string
 * @param {IInvalidCustomElementDecoratorFirstArgumentMustBeAStringFoveaDiagnosticCtor} diagnostic
 * @returns {IInvalidCustomElementDecoratorFirstArgumentMustBeAStringFoveaDiagnostic}
 */
function createInvalidCustomElementDecoratorFirstArgumentMustBeAStringDiagnostic ({code, hostName, length, file, start}: IInvalidCustomElementDecoratorFirstArgumentMustBeAStringFoveaDiagnosticCtor): IInvalidCustomElementDecoratorFirstArgumentMustBeAStringFoveaDiagnostic{
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `You provided a class${hostName == null ? "" : `, '${paintHost(hostName)}',`} that is annotated with the decorator: '${paintDecorator(`@${NAME.host.member.preCompile.decorator.customElement}`)}', but the selector it received as an argument wasn't a string. You must provide a string as an argument. For example: ${paintDecorator(`@${NAME.host.member.preCompile.decorator.customElement}("${computeSelectorNameFromClassName(hostName)}")`)}`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for a class that has a @customAttribute decorator, but the arguments it is given aren't statically analyzable
 * @param {IInvalidCustomAttributeDecoratorNotStaticallyAnalyzableFoveaDiagnosticCtor} diagnostic
 * @returns {IInvalidCustomAttributeDecoratorNotStaticallyAnalyzableFoveaDiagnostic}
 */
function createInvalidCustomAttributeDecoratorNotStaticallyAnalyzableDiagnostic ({code, hostName, length, file, start}: IInvalidCustomAttributeDecoratorNotStaticallyAnalyzableFoveaDiagnosticCtor): IInvalidCustomAttributeDecoratorNotStaticallyAnalyzableFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `You provided a class${hostName == null ? "" : `, '${paintHost(hostName)}',`} that is annotated with the decorator: '${paintDecorator(`@${NAME.host.member.preCompile.decorator.customAttribute}`)}', but the selector it received as an argument wasn't statically analyzable. You must provide a literal value as an argument. For example: ${paintDecorator(`@${NAME.host.member.preCompile.decorator.customAttribute}("${computeSelectorNameFromClassName(hostName)}")`)}`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for a class that has a @customAttribute decorator, but it isn't a CallExpression (e.g. it isn't invoked)
 * @param {IInvalidCustomAttributeDecoratorNotCalledFoveaDiagnosticCtor} diagnostic
 * @returns {IInvalidCustomAttributeDecoratorNotCalledFoveaDiagnostic}
 */
function createInvalidCustomAttributeDecoratorNotCalledDiagnostic ({code, hostName, start, file, length}: IInvalidCustomAttributeDecoratorNotCalledFoveaDiagnosticCtor): IInvalidCustomAttributeDecoratorNotCalledFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `You provided a class${hostName == null ? "" : `, '${paintHost(hostName)}',`} that is annotated with the decorator: '${paintDecorator(`@${NAME.host.member.preCompile.decorator.customAttribute}`)}', but it wasn't invoked. You must invoke the decorator and provide it with a selector name as an argument. For example: ${paintDecorator(`@${NAME.host.member.preCompile.decorator.customAttribute}("${computeSelectorNameFromClassName(hostName)}")`)}`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for a class that has a @customAttribute decorator, but it doesn't receive any arguments
 * @param {IInvalidCustomAttributeDecoratorNoArgumentsFoveaDiagnosticCtor} diagnostic
 * @returns {IInvalidCustomAttributeDecoratorNoArgumentsFoveaDiagnostic}
 */
function createInvalidCustomAttributeDecoratorNoArgumentsDiagnostic ({code, hostName, length, file, start}: IInvalidCustomAttributeDecoratorNoArgumentsFoveaDiagnosticCtor): IInvalidCustomAttributeDecoratorNoArgumentsFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `You provided a class${hostName == null ? "" : `, '${paintHost(hostName)}',`} that is annotated with the decorator: '${paintDecorator(`@${NAME.host.member.preCompile.decorator.customAttribute}`)}', but you didn't provide it with any arguments. You must provide it with a selector name as an argument. For example: ${paintDecorator(`@${NAME.host.member.preCompile.decorator.customAttribute}("${computeSelectorNameFromClassName(hostName)}")`)}`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for a class that has a @customAttribute decorator, but the first argument it receives isn't a string
 * @param {IInvalidCustomAttributeDecoratorFirstArgumentMustBeAStringFoveaDiagnosticCtor} diagnostic
 * @returns {IInvalidCustomAttributeDecoratorFirstArgumentMustBeAStringFoveaDiagnostic}
 */
function createInvalidCustomAttributeDecoratorFirstArgumentMustBeAStringDiagnostic ({code, hostName, length, file, start}: IInvalidCustomAttributeDecoratorFirstArgumentMustBeAStringFoveaDiagnosticCtor): IInvalidCustomAttributeDecoratorFirstArgumentMustBeAStringFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `You provided a class${hostName == null ? "" : `, '${paintHost(hostName)}',`} that is annotated with the decorator: '${paintDecorator(`@${NAME.host.member.preCompile.decorator.customAttribute}`)}', but the selector it received as an argument wasn't a string. You must provide a string as an argument. For example: ${paintDecorator(`@${NAME.host.member.preCompile.decorator.customAttribute}("${computeSelectorNameFromClassName(hostName)}")`)}`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for when a @customAttribute decorator annotates anything else than a class
 * @param {IInvalidCustomAttributeDecoratorPlacementFoveaDiagnosticCtor} diagnostic
 * @returns {IInvalidCustomAttributeDecoratorPlacementFoveaDiagnostic}
 */
function createInvalidCustomAttributeDecoratorPlacementDiagnostic ({code, placement, file, start, length}: IInvalidCustomAttributeDecoratorPlacementFoveaDiagnosticCtor): IInvalidCustomAttributeDecoratorPlacementFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `You have annotated a ${syntaxKindToHumanText(placement)} with the decorator: '${paintDecorator(`@${NAME.host.member.preCompile.decorator.customAttribute}`)}', but that decorator must only annotate ${syntaxKindToHumanText(SyntaxKind.ClassDeclaration, true)}`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for a @styleSrc decorator that is not properly invoked.
 * This will be the case if it doesn't follow any of the following forms:
 * 1) @styleSrc("<FILE_PATH>.[css|scss]")
 * 2) @styleSrc([..."<FILE_PATH>.[css|scss]"])
 * @param {IInvalidStyleSrcDecoratorUsageFoveaDiagnosticCtor} options
 * @returns {IInvalidStyleSrcDecoratorUsageFoveaDiagnostic}
 */
function createInvalidStyleSrcDecoratorUsageDiagnostic ({code, hostName, hostKind, length, start, file}: IInvalidStyleSrcDecoratorUsageFoveaDiagnosticCtor): IInvalidStyleSrcDecoratorUsageFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `${hostName == null ? `A ${stringifyHostKind(hostKind)}` : `The ${stringifyHostKind(hostKind)}: '${paintHost(hostName)}'`} is annotated with the decorator: '${paintDecorator(`@${NAME.host.member.preCompile.decorator.styleSrc}`)}', but the argument it receives must be a string or an array of strings representing paths to .css/.scss files. For example: ${paintDecorator(`@${NAME.host.member.preCompile.decorator.styleSrc}("./my-styles.scss")`)} or ${paintDecorator(`@${NAME.host.member.preCompile.decorator.styleSrc}([ "./a.scss", "./b.scss" ])`)}`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for a @templateSrc decorator that is not properly invoked.
 * This will be the case if it doesn't follow any of the following forms:
 * 1) @templateSrc("<FILE_PATH>.html")
 * 2) @templateSrc([..."<FILE_PATH>.html"])
 * @param {IInvalidTemplateSrcDecoratorUsageFoveaDiagnosticCtor} options
 * @returns {IInvalidTemplateSrcDecoratorUsageFoveaDiagnostic}
 */
function createInvalidTemplateSrcDecoratorUsageDiagnostic ({code, hostName, hostKind, file, start, length}: IInvalidTemplateSrcDecoratorUsageFoveaDiagnosticCtor): IInvalidTemplateSrcDecoratorUsageFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `${hostName == null ? `A ${stringifyHostKind(hostKind)}` : `The ${stringifyHostKind(hostKind)}: '${paintHost(hostName)}'`} is annotated with the decorator: '${paintDecorator(`@${NAME.host.member.preCompile.decorator.templateSrc}`)}', but the argument it receives must be a string or an array of strings representing paths to .html files. For example: ${paintDecorator(`@${NAME.host.member.preCompile.decorator.templateSrc}("./my-template.html")`)} or ${paintDecorator(`@${NAME.host.member.preCompile.decorator.templateSrc}([ "./a.html", "./b.html" ])`)}`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for a @hostAttributes decorator that is not properly invoked.
 * This will be the case if it doesn't follow the form: '@hostAttributes({foo: 1, bar: {baz: 2}})'
 * @param {IInvalidHostAttributesDecoratorUsageFoveaDiagnosticCtor} options
 * @returns {IInvalidHostAttributesDecoratorUsageFoveaDiagnostic}
 */
function createInvalidHostAttributesDecoratorUsageDiagnostic ({code, hostName, hostKind, length, start, file}: IInvalidHostAttributesDecoratorUsageFoveaDiagnosticCtor): IInvalidHostAttributesDecoratorUsageFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `${hostName == null ? `A ${stringifyHostKind(hostKind)}` : `The ${stringifyHostKind(hostKind)}: '${paintHost(hostName)}'`} is annotated with the decorator: '${paintDecorator(`@${NAME.host.member.preCompile.decorator.hostAttributes}`)}', but it must receive an object literal! For example: ${paintFunction(`{something: "value", style: {background: "red"}}`)}`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for something that expects only to receive literal values (e.g. no references)
 * @param {IOnlyLiteralValuesSupportedHereFoveaDiagnosticCtor} options
 * @returns {IOnlyLiteralValuesSupportedHereFoveaDiagnostic}
 */
function createOnlyLiteralValuesSupportedHereDiagnostic ({code, hostName, hostKind, content, file, start, length}: IOnlyLiteralValuesSupportedHereFoveaDiagnosticCtor): IOnlyLiteralValuesSupportedHereFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `${hostName == null ? `A ${stringifyHostKind(hostKind)}` : `The ${stringifyHostKind(hostKind)}: '${paintHost(hostName)}'`} includes the following code: '${paintFunction(content)}', but it must use only literal values here! References to other identifiers, shorthand property assignments, spread assignments, accessors, or method declarations were found, which is currently not supported for this type of use. Please follow a form that matches the following example: ${paintFunction(`{something: "value", style: {background: "red"}}`)}`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for a @dependsOn decorator that is not properly invoked.
 * This will be the case if it doesn't follow the form: '@dependsOn(...componentConstructors)'
 * @param {IInvalidDependsOnDecoratorUsageFoveaDiagnosticCtor} options
 * @returns {IInvalidDependsOnDecoratorUsageFoveaDiagnostic}
 */
function createInvalidDependsOnDecoratorUsageDiagnostic ({code, hostName, hostKind, length, start, file}: IInvalidDependsOnDecoratorUsageFoveaDiagnosticCtor): IInvalidDependsOnDecoratorUsageFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `${hostName == null ? `A ${stringifyHostKind(hostKind)}` : `The ${stringifyHostKind(hostKind)}: '${paintHost(hostName)}'`} is annotated with the decorator: '${paintDecorator(`@${NAME.host.member.preCompile.decorator.dependsOn}`)}', but the argument it receives must follow this syntax: ${paintFunction(`Component1, Component2, ..., ComponentN`)}`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for a @onChange decorator that is not properly invoked.
 * @param {IInvalidOnChangeDecoratorUsageFoveaDiagnosticCtor} options
 * @returns {IInvalidOnChangeDecoratorUsageFoveaDiagnostic}
 */
function createInvalidOnChangeDecoratorUsageDiagnostic ({code, hostName, hostKind, methodName, file, start, length}: IInvalidOnChangeDecoratorUsageFoveaDiagnosticCtor): IInvalidOnChangeDecoratorUsageFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `You have annotated the method '${paintFunction(methodName)}' on ${hostName == null ? `a ${stringifyHostKind(hostKind)}` : `the ${stringifyHostKind(hostKind)}: '${paintHost(hostName)}'`} with the decorator: '${paintDecorator(`@${NAME.host.member.preCompile.decorator.onChange}`)}', but you haven't provided it with any arguments. The first argument must be one or more props to observe!`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for a @listener decorator that is not properly invoked.
 * @param {IInvalidListenerDecoratorUsageFoveaDiagnosticCtor} options
 * @returns {IInvalidListenerDecoratorUsageFoveaDiagnostic}
 */
function createInvalidListenerDecoratorUsageDiagnostic ({code, hostName, hostKind, methodName, length, start, file}: IInvalidListenerDecoratorUsageFoveaDiagnosticCtor): IInvalidListenerDecoratorUsageFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `You have annotated the method '${paintFunction(methodName)}' on ${hostName == null ? `a ${stringifyHostKind(hostKind)}` : `the ${stringifyHostKind(hostKind)}: '${paintHost(hostName)}'`} with the decorator: '${paintDecorator(`@${NAME.host.member.preCompile.decorator.listener}`)}', but you haven't provided it with any arguments. The first argument must be one or more events to listen for!`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for a @[onBecameVisible|onBecameInvisible] decorator that is not properly invoked.
 * @param {IInvalidVisibilityObserverDecoratorUsageFoveaDiagnosticCtor} options
 * @returns {IInvalidVisibilityObserverDecoratorUsageFoveaDiagnostic}
 */
function createInvalidVisibilityObserverDecoratorUsageDiagnostic ({code, hostName, hostKind, methodName, decoratorName, file, start, length}: IInvalidVisibilityObserverDecoratorUsageFoveaDiagnosticCtor): IInvalidVisibilityObserverDecoratorUsageFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `You have annotated the method '${paintFunction(methodName)}' on ${hostName == null ? `a ${stringifyHostKind(hostKind)}` : `the ${stringifyHostKind(hostKind)}: '${paintHost(hostName)}'`} with the decorator: '${paintDecorator(`@${decoratorName}`)}', but you haven't invoked it. You must invoke it, optionally passing an object of arguments!`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for a @[onChildrenAdded|onChildrenRemoved] decorator that is not properly invoked.
 * @param {IInvalidChildListObserverDecoratorUsageFoveaDiagnosticCtor} options
 * @returns {IInvalidChildListObserverDecoratorUsageFoveaDiagnostic}
 */
function createInvalidChildListObserverDecoratorUsageDiagnostic ({code, hostName, hostKind, methodName, decoratorName, length, start, file}: IInvalidChildListObserverDecoratorUsageFoveaDiagnosticCtor): IInvalidChildListObserverDecoratorUsageFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `You have annotated the method '${paintFunction(methodName)}' on ${hostName == null ? `a ${stringifyHostKind(hostKind)}` : `the ${stringifyHostKind(hostKind)}: '${paintHost(hostName)}'`} with the decorator: '${paintDecorator(`@${decoratorName}`)}', but you haven't invoked it. In order to track child elements, you must invoke it, optionally passing an object of arguments!`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for a @onAttributeChange decorator that is not properly invoked.
 * @param {IInvalidAttributeObserverDecoratorUsageFoveaDiagnosticCtor} options
 * @returns {IInvalidAttributeObserverDecoratorUsageFoveaDiagnostic}
 */
function createInvalidAttributeObserverDecoratorUsageDiagnostic ({code, hostName, hostKind, methodName, file, start, length}: IInvalidAttributeObserverDecoratorUsageFoveaDiagnosticCtor): IInvalidAttributeObserverDecoratorUsageFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `You have annotated the method '${paintFunction(methodName)}' on ${hostName == null ? `a ${stringifyHostKind(hostKind)}` : `the ${stringifyHostKind(hostKind)}: '${paintHost(hostName)}'`} with the decorator: '${paintDecorator(`@${NAME.host.member.preCompile.decorator.onAttributeChange}`)}', but you haven't provided it with any arguments. The first argument must be one or more attributes to observe changes for!`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for a @styleSrc decorator that references a file that could not be resolved.
 * This usually happens because the user provided the wrong filename
 * @param {IUnresolvedStyleSrcFoveaDiagnosticCtor} options
 * @returns {IUnresolvedStyleSrcFoveaDiagnostic}
 */
function createUnresolvedStyleSrcDiagnostic ({code, hostName, hostKind, path, length, start, file}: IUnresolvedStyleSrcFoveaDiagnosticCtor): IUnresolvedStyleSrcFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `${hostName == null ? `A ${stringifyHostKind(hostKind)}` : `The ${stringifyHostKind(hostKind)}: '${paintHost(hostName)}'`} is annotated with the decorator: ${paintDecorator(`@${NAME.host.member.preCompile.decorator.styleSrc}`)}, but the path: '${paintMetadata(path)}' could not be resolved.`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for a @templateSrc decorator that references a file that could not be resolved.
 * This usually happens because the user provided the wrong filename
 * @param {string} file
 * @param {IUnresolvedTemplateSrcFoveaDiagnosticCtor} options
 * @returns {IUnresolvedTemplateSrcFoveaDiagnostic}
 */
function createUnresolvedTemplateSrcDiagnostic ({code, hostName, hostKind, path, file, start, length}: IUnresolvedTemplateSrcFoveaDiagnosticCtor): IUnresolvedTemplateSrcFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `${hostName == null ? `A ${stringifyHostKind(hostKind)}` : `The ${stringifyHostKind(hostKind)}: '${paintHost(hostName)}'`} is annotated with the decorator: ${paintDecorator(`@${NAME.host.member.preCompile.decorator.templateSrc}`)}, but the path: '${paintMetadata(path)}' could not be resolved.`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for a selector that doesn't comply with the
 * requirements of the Custom Elements v1 spec because it doesn't include at least one hyphen.
 * @param {IInvalidSelectorNeedsHyphenFoveaDiagnosticCtor} options
 * @returns {IInvalidSelectorNeedsHyphenFoveaDiagnostic}
 */
function createInvalidSelectorNeedsHyphenDiagnostic ({code, hostName, hostKind, selector, start, length, file}: IInvalidSelectorNeedsHyphenFoveaDiagnosticCtor): IInvalidSelectorNeedsHyphenFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `${hostName == null ? `A ${stringifyHostKind(hostKind)}` : `The ${stringifyHostKind(hostKind)}: '${paintHost(hostName)}'`} is registered with an invalid selector: '${paintSelector(selector)}'! Custom Element selectors must contain a "-". For example: ${paintSelector(`"${computeSelectorNameFromClassName(hostName)}"`)}`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for a selector that doesn't comply with the
 * requirements of the Custom Elements v1 spec because it includes whitespace
 * @param {IInvalidSelectorHasWhitespaceFoveaDiagnosticCtor} options
 * @returns {IInvalidSelectorHasWhitespaceFoveaDiagnostic}
 */
function createInvalidSelectorHasWhitespaceDiagnostic ({code, hostName, hostKind, selector, file, length, start}: IInvalidSelectorHasWhitespaceFoveaDiagnosticCtor): IInvalidSelectorHasWhitespaceFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `${hostName == null ? `A ${stringifyHostKind(hostKind)}` : `The ${stringifyHostKind(hostKind)}: '${paintHost(hostName)}'`} is registered with an invalid selector: '${paintSelector(selector)}'! Custom Element selectors must not contain whitespace. For example: ${paintSelector(`"${computeSelectorNameFromClassName(hostName)}"`)}`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}

/**
 * Creates a diagnostic for a selector that doesn't comply with the
 * requirements of the Custom Elements v1 spec because it is in mix-case (e.g. isn't in all-lower-case)
 * @param {IInvalidSelectorIsNotAllLowerCaseFoveaDiagnosticCtor} options
 * @returns {IInvalidSelectorIsNotAllLowerCaseFoveaDiagnostic}
 */
function createInvalidSelectorIsNotAllLowerCaseDiagnostic ({code, hostName, hostKind, selector, start, length, file}: IInvalidSelectorIsNotAllLowerCaseFoveaDiagnosticCtor): IInvalidSelectorIsNotAllLowerCaseFoveaDiagnostic {
	return {
		category: DiagnosticCategory.Error,
		code,
		file,
		messageText: `${hostName == null ? `A ${stringifyHostKind(hostKind)}` : `The ${stringifyHostKind(hostKind)}: '${paintHost(hostName)}'`} is registered with an invalid selector: '${paintSelector(selector)}'! Custom Element selectors must be in lower-case. For example: ${paintSelector(`"${computeSelectorNameFromClassName(hostName)}"`)}`,
		start,
		length,
		scope: NAME.diagnostic.scope,
		source: NAME.diagnostic.source
	};
}