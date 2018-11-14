import {FoveaDiagnosticCtor, IAmbiguousHostFoveaDiagnosticCtor, IInvalidAttributeObserverDecoratorUsageFoveaDiagnosticCtor, IInvalidChildListObserverDecoratorUsageFoveaDiagnosticCtor, IInvalidCssFoveaDiagnosticCtor, IInvalidDependsOnDecoratorUsageFoveaDiagnosticCtor, IInvalidHostAttributesDecoratorUsageFoveaDiagnosticCtor, IInvalidHostListenerDecoratorUsageFoveaDiagnosticCtor, IInvalidOnChangeDecoratorUsageFoveaDiagnosticCtor, IInvalidSelectorDecoratorUsageFoveaDiagnosticCtor, IInvalidSelectorHasWhitespaceFoveaDiagnosticCtor, IInvalidSelectorIsNotAllLowerCaseFoveaDiagnosticCtor, IInvalidSelectorNeedsHyphenFoveaDiagnosticCtor, IInvalidSrcDecoratorUsageFoveaDiagnosticCtor, IInvalidTemplateFoveaDiagnosticCtor, IInvalidVisibilityObserverDecoratorUsageFoveaDiagnosticCtor, IOnlyLiteralValuesSupportedHereFoveaDiagnosticCtor, IUnknownSelectorFoveaDiagnosticCtor, IUnresolvedSrcFoveaDiagnosticCtor} from "./fovea-diagnostic-ctor";
import {FoveaDiagnosticKind} from "./fovea-diagnostic-kind";
import {FoveaDiagnosticDegree} from "./fovea-diagnostic-degree";
import {paintDecorator, paintError, paintFunction, paintHost, paintMetadata, paintSelector} from "./paint";
import {finalizeDiagnostic, stringifyHostKind} from "./serialize";
import {FoveaDiagnostic, IAmbiguousHostFoveaDiagnostic, IInvalidAttributeObserverDecoratorUsageFoveaDiagnostic, IInvalidChildListObserverDecoratorUsageFoveaDiagnostic, IInvalidCssFoveaDiagnostic, IInvalidDependsOnDecoratorUsageFoveaDiagnostic, IInvalidHostAttributesDecoratorUsageFoveaDiagnostic, IInvalidHostListenerDecoratorUsageFoveaDiagnostic, IInvalidOnChangeDecoratorUsageFoveaDiagnostic, IInvalidSelectorDecoratorUsageFoveaDiagnostic, IInvalidSelectorHasWhitespaceFoveaDiagnostic, IInvalidSelectorNeedsHyphenFoveaDiagnostic, IInvalidSrcDecoratorUsageFoveaDiagnostic, IInvalidTemplateFoveaDiagnostic, IInvalidVisibilityObserverDecoratorUsageFoveaDiagnostic, IOnlyLiteralValuesSupportedHereFoveaDiagnostic, IUnknownSelectorFoveaDiagnostic, IUnresolvedSrcFoveaDiagnostic, IInvalidSelectorIsNotAllLowerCaseFoveaDiagnostic} from "./fovea-diagnostic";
import {configuration} from "../configuration/configuration";

/**
 * Creates a diagnostic for the given file based on the given options
 * @param {string} file
 * @param {FoveaDiagnosticCtor} diagnostic
 */
export function createFoveaDiagnostic (file: string, diagnostic: FoveaDiagnosticCtor): FoveaDiagnostic {
	switch (diagnostic.kind) {
		case FoveaDiagnosticKind.UNKNOWN_SELECTOR:
			return createUnknownSelectorDiagnostic(file, diagnostic);

		case FoveaDiagnosticKind.AMBIGUOUS_HOST:
			return createAmbiguousHostDiagnostic(file, diagnostic);

		case FoveaDiagnosticKind.INVALID_SRC_DECORATOR_USAGE:
			return createInvalidSrcDecoratorUsageDiagnostic(file, diagnostic);

		case FoveaDiagnosticKind.INVALID_DEPENDS_ON_DECORATOR_USAGE:
			return createInvalidDependsOnDecoratorUsageDiagnostic(file, diagnostic);

		case FoveaDiagnosticKind.INVALID_SELECTOR_DECORATOR_USAGE:
			return createInvalidSelectorDecoratorUsageDiagnostic(file, diagnostic);

		case FoveaDiagnosticKind.INVALID_ON_CHANGE_DECORATOR_USAGE:
			return createInvalidOnChangeDecoratorUsageDiagnostic(file, diagnostic);

		case FoveaDiagnosticKind.INVALID_HOST_LISTENER_DECORATOR_USAGE:
			return createInvalidHostListenerDecoratorUsageDiagnostic(file, diagnostic);

		case FoveaDiagnosticKind.INVALID_VISIBILITY_OBSERVER_DECORATOR_USAGE:
			return createInvalidVisibilityObserverDecoratorUsageDiagnostic(file, diagnostic);

		case FoveaDiagnosticKind.INVALID_CHILD_LIST_OBSERVER_DECORATOR_USAGE:
			return createInvalidChildListObserverDecoratorUsageDiagnostic(file, diagnostic);

		case FoveaDiagnosticKind.INVALID_ATTRIBUTE_OBSERVER_DECORATOR_USAGE:
			return createInvalidAttributeObserverDecoratorUsageDiagnostic(file, diagnostic);

		case FoveaDiagnosticKind.UNRESOLVED_SRC:
			return createUnresolvedSrcDiagnostic(file, diagnostic);

		case FoveaDiagnosticKind.INVALID_SELECTOR_NEEDS_HYPHEN:
			return createInvalidSelectorNeedsHyphenDiagnostic(file, diagnostic);

		case FoveaDiagnosticKind.INVALID_SELECTOR_HAS_WHITESPACE:
			return createInvalidSelectorHasWhitespaceDiagnostic(file, diagnostic);

		case FoveaDiagnosticKind.INVALID_SELECTOR_IS_NOT_ALL_LOWER_CASE:
			return createInvalidSelectorIsNotAllLowerCaseDiagnostic(file, diagnostic);

		case FoveaDiagnosticKind.INVALID_CSS:
			return createInvalidCssDiagnostic(file, diagnostic);

		case FoveaDiagnosticKind.INVALID_TEMPLATE:
			return createInvalidTemplateDiagnostic(file, diagnostic);

		case FoveaDiagnosticKind.INVALID_HOST_ATTRIBUTES_DECORATOR_USAGE:
			return createInvalidHostAttributesDecoratorUsageDiagnostic(file, diagnostic);

		case FoveaDiagnosticKind.ONLY_LITERAL_VALUES_SUPPORTED_HERE:
			return createOnlyLiteralValuesSupportedHereDiagnostic(file, diagnostic);
	}
}

/**
 * Creates a diagnostic for a reference to an unknown selector within a template for a component.
 * This is usually due to the wrong selector being used or the file containing the selector not
 * being imported prior to using it
 * @param {string} file
 * @param {IUnknownSelectorFoveaDiagnosticCtor} diagnostic
 * @returns {IUnknownSelectorFoveaDiagnostic}
 */
function createUnknownSelectorDiagnostic (file: string, {kind, hostName, selector, hostKind}: IUnknownSelectorFoveaDiagnosticCtor): IUnknownSelectorFoveaDiagnostic {
	return finalizeDiagnostic({
		kind, file, degree: FoveaDiagnosticDegree.WARNING, selector,
		description: `You depend on the ${stringifyHostKind(hostKind)} with selector: '${paintSelector(selector)}' within the template for the component '${paintHost(hostName)}', but no ${stringifyHostKind(hostKind)} with that selector could be resolved`
	});
}

/**
 * Creates a diagnostic for a invalid CSS contents. This will be the case if PostCSS of node-sass determines
 * a semantic or syntactical error.
 * @param {string} file
 * @param {IInvalidCssFoveaDiagnosticCtor} diagnostic
 * @returns {IInvalidCssFoveaDiagnostic}
 */
function createInvalidCssDiagnostic (file: string, {kind, formattedErrorMessage}: IInvalidCssFoveaDiagnosticCtor): IInvalidCssFoveaDiagnostic {
	return finalizeDiagnostic({
		kind, file, degree: FoveaDiagnosticDegree.ERROR,
		description: `The styles provided in file: '${file}' is invalid. Here's the full error message:\n. ${paintError(formattedErrorMessage)}`
	});
}

/**
 * Creates a diagnostic for a invalid Template contents. This will be the case if @fovea/dom discovers a semantic or syntactical error.
 * @param {string} file
 * @param {IInvalidTemplateFoveaDiagnosticCtor} diagnostic
 * @returns {IInvalidTemplateFoveaDiagnostic}
 */
function createInvalidTemplateDiagnostic (file: string, {kind, formattedErrorMessage}: IInvalidTemplateFoveaDiagnosticCtor): IInvalidTemplateFoveaDiagnostic {
	return finalizeDiagnostic({
		kind, file, degree: FoveaDiagnosticDegree.ERROR,
		description: `The template provided in file: '${file}' is invalid. Here's the full error message:\n. ${paintError(formattedErrorMessage)}`
	});
}

/**
 * Creates a diagnostic for a class that both extends HTMLElement (directly or by inheritance) *AND* is decorated with the @customAttribute decorator (and thus is a custom attribute).
 * In this case, Fovea doesn't know whether to treat it as a component or a custom attribute and should fail for that file.
 * @param {string} file
 * @param {IAmbiguousHostFoveaDiagnosticCtor} diagnostic
 * @returns {IAmbiguousHostFoveaDiagnosticCtor}
 */
function createAmbiguousHostDiagnostic (file: string, {kind, hostName, extendsName}: IAmbiguousHostFoveaDiagnosticCtor): IAmbiguousHostFoveaDiagnostic {
	return finalizeDiagnostic({
		kind, file, degree: FoveaDiagnosticDegree.ERROR,
		description: `You provided a class, '${paintHost(hostName)}', that both extends '${paintHost(extendsName)}' AND is annotated with the '${paintDecorator(configuration.preCompile.customAttributeDecoratorName)} decorator'. You must either extend an element or define a Custom Attribute, but you cannot do both at the same time. Please remove one of them`
	});
}

/**
 * Creates a diagnostic for a @styleSrc or @templateSrc decorator that is not properly invoked.
 * This will be the case if it doesn't follow the form: '@[styleSrc|templateSrc](<FILE_PATH>.[css|scss])'
 * @param {string} file
 * @param {FoveaDiagnosticKind.INVALID_SRC_DECORATOR_USAGE} kind
 * @param {string} hostName
 * @param {FoveaHostKind | string} hostKind
 * @param {string} decoratorContent
 * @returns {IInvalidSrcDecoratorUsageFoveaDiagnostic}
 */
function createInvalidSrcDecoratorUsageDiagnostic (file: string, {kind, hostName, hostKind, decoratorContent}: IInvalidSrcDecoratorUsageFoveaDiagnosticCtor): IInvalidSrcDecoratorUsageFoveaDiagnostic {
	return finalizeDiagnostic({
		kind, file, degree: FoveaDiagnosticDegree.ERROR,
		description: `The ${stringifyHostKind(hostKind)}: '${paintHost(hostName)}' is annotated with the decorator: '${paintDecorator(`@${decoratorContent}`)}', but the argument it receives must follow this syntax: ${paintFunction(`<PATH_TO_FILE>.[css|scss]`)}`
	});
}

/**
 * Creates a diagnostic for a @hostAttributes decorator that is not properly invoked.
 * This will be the case if it doesn't follow the form: '@hostAttributes({foo: 1, bar: {baz: 2}})'
 * @param {string} file
 * @param {FoveaDiagnosticKind.INVALID_HOST_ATTRIBUTES_DECORATOR_USAGE} kind
 * @param {string} hostName
 * @param {FoveaHostKind | string} hostKind
 * @param {string} decoratorContent
 * @returns {IInvalidHostAttributesDecoratorUsageFoveaDiagnostic}
 */
function createInvalidHostAttributesDecoratorUsageDiagnostic (file: string, {kind, hostName, hostKind, decoratorContent}: IInvalidHostAttributesDecoratorUsageFoveaDiagnosticCtor): IInvalidHostAttributesDecoratorUsageFoveaDiagnostic {
	return finalizeDiagnostic({
		kind, file, degree: FoveaDiagnosticDegree.ERROR,
		description: `The ${stringifyHostKind(hostKind)}: '${paintHost(hostName)}' is annotated with the decorator: '${paintDecorator(`@${decoratorContent}`)}', but it must receive an object literal! For example: ${paintFunction(`{something: "value", style: {background: "red"}}`)}`
	});
}

/**
 * Creates a diagnostic for something that expects only to receive literal values (e.g. no references)
 * @param {string} file
 * @param {FoveaDiagnosticKind.ONLY_LITERAL_VALUES_SUPPORTED_HERE} kind
 * @param {string} hostName
 * @param {FoveaHostKind | string} hostKind
 * @param {string} decoratorContent
 * @returns {IOnlyLiteralValuesSupportedHereFoveaDiagnostic}
 */
function createOnlyLiteralValuesSupportedHereDiagnostic (file: string, {kind, hostName, hostKind, decoratorContent}: IOnlyLiteralValuesSupportedHereFoveaDiagnosticCtor): IOnlyLiteralValuesSupportedHereFoveaDiagnostic {
	return finalizeDiagnostic({
		kind, file, degree: FoveaDiagnosticDegree.ERROR,
		description: `The ${stringifyHostKind(hostKind)}: '${paintHost(hostName)}' is annotated with the decorator: '${paintDecorator(`@${decoratorContent}`)}', but it must receive only literal values! References to other identifiers, shorthand property assignments, spread assignments, accessors, or method declarations were found, which is currently not supported for this type of decorator. Please following a form that matches the following example: ${paintFunction(`{something: "value", style: {background: "red"}}`)}`
	});
}

/**
 * Creates a diagnostic for a @dependsOn decorator that is not properly invoked.
 * This will be the case if it doesn't follow the form: '@dependsOn(...componentConstructors)'
 * @param {string} file
 * @param {FoveaDiagnosticKind.INVALID_DEPENDS_ON_DECORATOR_USAGE} kind
 * @param {string} hostName
 * @param {FoveaHostKind | string} hostKind
 * @param {string} decoratorContent
 * @returns {IInvalidDependsOnDecoratorUsageFoveaDiagnostic}
 */
function createInvalidDependsOnDecoratorUsageDiagnostic (file: string, {kind, hostName, hostKind, decoratorContent}: IInvalidDependsOnDecoratorUsageFoveaDiagnosticCtor): IInvalidDependsOnDecoratorUsageFoveaDiagnostic {
	return finalizeDiagnostic({
		kind, file, degree: FoveaDiagnosticDegree.ERROR,
		description: `The ${stringifyHostKind(hostKind)}: '${paintHost(hostName)}' is annotated with the decorator: '${paintDecorator(`@${decoratorContent}`)}', but the argument it receives must follow this syntax: ${paintFunction(`Component1, Component2, ..., ComponentN`)}`
	});
}

/**
 * Creates a diagnostic for a @selector decorator that is not properly invoked.
 * This will be the case if it doesn't follow the form: '@selector("<SELECTOR_NAME>")'
 * @param {string} file
 * @param {FoveaDiagnosticKind.INVALID_SELECTOR_DECORATOR_USAGE} kind
 * @param {string} hostName
 * @param {FoveaHostKind | string} hostKind
 * @param {string} decoratorContent
 * @returns {IInvalidSelectorDecoratorUsageFoveaDiagnostic}
 */
function createInvalidSelectorDecoratorUsageDiagnostic (file: string, {kind, hostName, hostKind, decoratorContent}: IInvalidSelectorDecoratorUsageFoveaDiagnosticCtor): IInvalidSelectorDecoratorUsageFoveaDiagnostic {
	return finalizeDiagnostic({
		kind, file, degree: FoveaDiagnosticDegree.ERROR,
		description: `The ${stringifyHostKind(hostKind)}: '${paintHost(hostName)}' is annotated with the decorator: '${paintDecorator(`@${decoratorContent}`)}', but it must follow this syntax: ${paintDecorator(`@${configuration.preCompile.selectorDecoratorName}("<SELECTOR_NAME>")`)}`
	});
}

/**
 * Creates a diagnostic for a @onChange decorator that is not properly invoked.
 * @param {string} file
 * @param {FoveaDiagnosticKind.INVALID_ON_CHANGE_DECORATOR_USAGE} kind
 * @param {string} hostName
 * @param {FoveaHostKind | string} hostKind
 * @param {string} decoratorContent
 * @param {string} methodName
 * @returns {IInvalidOnChangeDecoratorUsageFoveaDiagnostic}
 */
function createInvalidOnChangeDecoratorUsageDiagnostic (file: string, {kind, hostName, hostKind, decoratorContent, methodName}: IInvalidOnChangeDecoratorUsageFoveaDiagnosticCtor): IInvalidOnChangeDecoratorUsageFoveaDiagnostic {
	return finalizeDiagnostic({
		kind, file, degree: FoveaDiagnosticDegree.ERROR,
		description: `You have annotated the method '${paintFunction(methodName)}' on the ${stringifyHostKind(hostKind)} '${paintHost(hostName)}' with the decorator: '${paintDecorator(`@${decoratorContent}`)}', but you haven't provided it with any arguments. The first argument must be one or more props to observe!`
	});
}

/**
 * Creates a diagnostic for a @hostListener decorator that is not properly invoked.
 * @param {string} file
 * @param {FoveaDiagnosticKind.INVALID_HOST_LISTENER_DECORATOR_USAGE} kind
 * @param {string} hostName
 * @param {FoveaHostKind | string} hostKind
 * @param {string} decoratorContent
 * @param {string} methodName
 * @returns {IInvalidHostListenerDecoratorUsageFoveaDiagnostic}
 */
function createInvalidHostListenerDecoratorUsageDiagnostic (file: string, {kind, hostName, hostKind, decoratorContent, methodName}: IInvalidHostListenerDecoratorUsageFoveaDiagnosticCtor): IInvalidHostListenerDecoratorUsageFoveaDiagnostic {
	return finalizeDiagnostic({
		kind, file, degree: FoveaDiagnosticDegree.ERROR,
		description: `You have annotated the method '${paintFunction(methodName)}' on the ${stringifyHostKind(hostKind)} '${paintHost(hostName)}' with the decorator: '${paintDecorator(`@${decoratorContent}`)}', but you haven't provided it with any arguments. The first argument must be one or more events to listen for!`
	});
}

/**
 * Creates a diagnostic for a @[onBecameVisible|onBecameInvisible] decorator that is not properly invoked.
 * @param {string} file
 * @param {FoveaDiagnosticKind.INVALID_VISIBILITY_OBSERVER_DECORATOR_USAGE} kind
 * @param {string} hostName
 * @param {FoveaHostKind | string} hostKind
 * @param {string} decoratorContent
 * @param {string} methodName
 * @returns {IInvalidVisibilityObserverDecoratorUsageFoveaDiagnostic}
 */
function createInvalidVisibilityObserverDecoratorUsageDiagnostic (file: string, {kind, hostName, hostKind, decoratorContent, methodName}: IInvalidVisibilityObserverDecoratorUsageFoveaDiagnosticCtor): IInvalidVisibilityObserverDecoratorUsageFoveaDiagnostic {
	return finalizeDiagnostic({
		kind, file, degree: FoveaDiagnosticDegree.ERROR,
		description: `You have annotated the method '${paintFunction(methodName)}' on the ${stringifyHostKind(hostKind)} '${paintHost(hostName)}' with the decorator: '${paintDecorator(`@${decoratorContent}`)}', but you haven't invoked it. You must invoke it, optionally passing an object of arguments!`
	});
}

/**
 * Creates a diagnostic for a @[onChildrenAdded|onChildrenRemoved] decorator that is not properly invoked.
 * @param {string} file
 * @param {FoveaDiagnosticKind.INVALID_CHILD_LIST_OBSERVER_DECORATOR_USAGE} kind
 * @param {string} hostName
 * @param {FoveaHostKind | string} hostKind
 * @param {string} decoratorContent
 * @param {string} methodName
 * @returns {IInvalidChildListObserverDecoratorUsageFoveaDiagnostic}
 */
function createInvalidChildListObserverDecoratorUsageDiagnostic (file: string, {kind, hostName, hostKind, decoratorContent, methodName}: IInvalidChildListObserverDecoratorUsageFoveaDiagnosticCtor): IInvalidChildListObserverDecoratorUsageFoveaDiagnostic {
	return finalizeDiagnostic({
		kind, file, degree: FoveaDiagnosticDegree.ERROR,
		description: `You have annotated the method '${paintFunction(methodName)}' on the ${stringifyHostKind(hostKind)} '${paintHost(hostName)}' with the decorator: '${paintDecorator(`@${decoratorContent}`)}', but you haven't invoked it. In order to track child elements, you must invoke it, optionally passing an object of arguments!`
	});
}

/**
 * Creates a diagnostic for a @onAttributeChange decorator that is not properly invoked.
 * @param {string} file
 * @param {FoveaDiagnosticKind.INVALID_ATTRIBUTE_OBSERVER_DECORATOR_USAGE} kind
 * @param {string} hostName
 * @param {FoveaHostKind | string} hostKind
 * @param {string} decoratorContent
 * @param {string} methodName
 * @returns {IInvalidAttributeObserverDecoratorUsageFoveaDiagnostic}
 */
function createInvalidAttributeObserverDecoratorUsageDiagnostic (file: string, {kind, hostName, hostKind, decoratorContent, methodName}: IInvalidAttributeObserverDecoratorUsageFoveaDiagnosticCtor): IInvalidAttributeObserverDecoratorUsageFoveaDiagnostic {
	return finalizeDiagnostic({
		kind, file, degree: FoveaDiagnosticDegree.ERROR,
		description: `You have annotated the method '${paintFunction(methodName)}' on the ${stringifyHostKind(hostKind)} '${paintHost(hostName)}' with the decorator: '${paintDecorator(`@${decoratorContent}`)}', but you haven't provided it with any arguments. The first argument must be one or more attributes to observe changes for!`
	});
}

/**
 * Creates a diagnostic for a @[styleSrc|templateSrc] decorator that references a file that could not be resolved.
 * This usually happens because the user provided the wrong filename
 * @param {string} file
 * @param {FoveaDiagnosticKind.UNRESOLVED_SRC} kind
 * @param {string} hostName
 * @param {FoveaHostKind | string} hostKind
 * @param {string} decoratorContent
 * @param {string} path
 * @returns {IUnresolvedSrcFoveaDiagnostic}
 */
function createUnresolvedSrcDiagnostic (file: string, {kind, hostName, hostKind, decoratorContent, path}: IUnresolvedSrcFoveaDiagnosticCtor): IUnresolvedSrcFoveaDiagnostic {
	return finalizeDiagnostic({
		kind, file, degree: FoveaDiagnosticDegree.ERROR,
		description: `The ${stringifyHostKind(hostKind)}: '${paintHost(hostName)}' is annotated with the decorator: ${paintDecorator(`@${decoratorContent}`)}, but the path: '${paintMetadata(path)}' could not be resolved. Are you sure you provided the correct filename?`
	});
}

/**
 * Creates a diagnostic for a @selector decorator that defines a selector that doesn't comply with the
 * requirements of the Custom Elements v1 spec because it doesn't include at least one hyphen.
 * @param {string} file
 * @param {FoveaDiagnosticKind.INVALID_SELECTOR_NEEDS_HYPHEN} kind
 * @param {string} hostName
 * @param {FoveaHostKind | string} hostKind
 * @param {string} decoratorContent
 * @param {string} selector
 * @returns {IInvalidSelectorNeedsHyphenFoveaDiagnostic}
 */
function createInvalidSelectorNeedsHyphenDiagnostic (file: string, {kind, hostName, hostKind, decoratorContent, selector}: IInvalidSelectorNeedsHyphenFoveaDiagnosticCtor): IInvalidSelectorNeedsHyphenFoveaDiagnostic {
	return finalizeDiagnostic({
		kind, file, degree: FoveaDiagnosticDegree.ERROR,
		description: `The ${stringifyHostKind(hostKind)}: '${paintHost(hostName)}' is annotated with the decorator: '${paintDecorator(`@${decoratorContent}`)}', but the provided selector: '${paintMetadata(selector)}' is not valid! Custom Element selectors must contain a "-".`
	});
}

/**
 * Creates a diagnostic for a @selector decorator that defines a selector that doesn't comply with the
 * requirements of the Custom Elements v1 spec because it includes whitespace
 * @param {string} file
 * @param {FoveaDiagnosticKind.INVALID_SELECTOR_HAS_WHITESPACE} kind
 * @param {string} hostName
 * @param {FoveaHostKind | string} hostKind
 * @param {string} decoratorContent
 * @param {string} selector
 * @returns {IInvalidSelectorHasWhitespaceFoveaDiagnostic}
 */
function createInvalidSelectorHasWhitespaceDiagnostic (file: string, {kind, hostName, hostKind, decoratorContent, selector}: IInvalidSelectorHasWhitespaceFoveaDiagnosticCtor): IInvalidSelectorHasWhitespaceFoveaDiagnostic {
	return finalizeDiagnostic({
		kind, file, degree: FoveaDiagnosticDegree.ERROR,
		description: `The ${stringifyHostKind(hostKind)}: '${paintHost(hostName)}' is annotated with the decorator: '${paintDecorator(`@${decoratorContent}`)}', but the provided selector: '${paintMetadata(selector)}' is not valid! Custom Element selectors must not include whitespace.`
	});
}

/**
 * Creates a diagnostic for a @selector decorator that defines a selector that doesn't comply with the
 * requirements of the Custom Elements v1 spec because it is in mix-case (e.g. isn't in all-lower-case)
 * @param {string} file
 * @param {FoveaDiagnosticKind.INVALID_SELECTOR_IS_NOT_ALL_LOWER_CASE} kind
 * @param {string} hostName
 * @param {FoveaHostKind | string} hostKind
 * @param {string} decoratorContent
 * @param {string} selector
 * @retruns {IInvalidSelectorIsNotAllLowerCaseFoveaDiagnostic}
 */
function createInvalidSelectorIsNotAllLowerCaseDiagnostic (file: string, {kind, hostName, hostKind, decoratorContent, selector}: IInvalidSelectorIsNotAllLowerCaseFoveaDiagnosticCtor): IInvalidSelectorIsNotAllLowerCaseFoveaDiagnostic {
	return finalizeDiagnostic({
		kind, file, degree: FoveaDiagnosticDegree.ERROR,
		description: `The ${stringifyHostKind(hostKind)}: '${paintHost(hostName)}' is annotated with the decorator: '${paintDecorator(`@${decoratorContent}`)}', but the provided selector: '${paintMetadata(selector)}' is not valid! Custom Element selectors must be in lower-case.`
	});
}