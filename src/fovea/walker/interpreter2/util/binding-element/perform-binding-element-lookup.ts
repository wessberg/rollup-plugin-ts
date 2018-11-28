import {BindingElement, isArrayBindingPattern, isIdentifier, isObjectBindingPattern} from "typescript";
import {Literal} from "../../literal/literal";
import {LexicalEnvironment} from "../../lexical-environment/lexical-environment";
import {NodeEvaluator} from "../../evaluator/node-evaluator/node-evaluator";
import {Continuation} from "../../continuation/continuation";
import {cpsMap} from "../cps/map";

/**
 * Performs a lookup within the given value based on the given BindingElement where there is no PropertyName
 * @param {BindingElement} element
 * @param {Literal} value
 * @param {LexicalEnvironment} environment
 * @param {NodeEvaluator} evaluate
 * @param {Continuation} continuation
 */
function performBindingElementLookupWithoutPropertyName (element: Pick<BindingElement, Exclude<keyof BindingElement, "propertyName">>, value: Literal, environment: LexicalEnvironment, evaluate: NodeEvaluator, continuation: Continuation<{ [key: string]: Literal }>): void {
	// If the value is undefined and the element has an initializer, use that value instead
	((next: Continuation) => {
		if (value == null && element.initializer != null) {
			evaluate(element.initializer, environment, next);
		} else next(value);
	})((normalizedValue) => {
		if (isIdentifier(element.name)) {
			return continuation({[element.name.text]: normalizedValue[element.name.text]});
		}

		else if (isObjectBindingPattern(element.name)) {
			cpsMap(
				element.name.elements,
				(elem, _, next) => performBindingElementLookup(elem, normalizedValue, environment, evaluate, next),
				(mappedElements => continuation(Object.assign({}, ...mappedElements)))
			);
		}

		else if (isArrayBindingPattern(element.name)) {
			throw new Error("not implemented");
		}

		else continuation({});
	});
}

/**
 * Performs a lookup within the given value based on the given BindingElement
 * @param {BindingElement} element
 * @param {Literal} value
 * @param {LexicalEnvironment} environment
 * @param {NodeEvaluator} evaluate
 * @param {Continuation} continuation
 */
export function performBindingElementLookup (element: BindingElement, value: Literal, environment: LexicalEnvironment, evaluate: NodeEvaluator, continuation: Continuation<{ [key: string]: Literal }>): void {
	if (element.propertyName == null) {
		return performBindingElementLookupWithoutPropertyName(element, value, environment, evaluate, continuation);
	}

	// Get The literal value of the property name
	evaluate(element.propertyName, environment, propertyName => {

		((firstPartContinuation: Continuation) => {
			// Pick the first part based on the property name
			const firstPart = value == null ? undefined : value[propertyName];

			// If the part is undefined and the element has an initializer, use that value instead
			if (firstPart == null && element.initializer != null) {
				return evaluate(element.initializer, environment, firstPartContinuation);
			}

			else return firstPartContinuation(firstPart);
		})((firstPart => {
			// If the name is an identifier, it is a renamed binding for what was extracted from the PropertyName.
			if (isIdentifier(element.name)) {
				return continuation({[element.name.text]: firstPart});
			}

			else if (isObjectBindingPattern(element.name)) {
				cpsMap(
					element.name.elements,
					(elem, _, next) => performBindingElementLookup(elem, value, environment, evaluate, next),
					(mappedElements => continuation(Object.assign({}, ...mappedElements)))
				);
			}

			else if (isArrayBindingPattern(element.name)) {
				throw new Error("not implemented");
			}

			return continuation({});
		}));
	});
}