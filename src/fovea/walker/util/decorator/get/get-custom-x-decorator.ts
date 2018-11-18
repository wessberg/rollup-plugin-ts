import {Decorator, Node} from "typescript";
import {FoveaDecoratorCustomHostName} from "../../../../constant/constant";
import {isCustomXDecorator} from "../is/is-custom-x-decorator";
import {ICustomXDecorator} from "../i-custom-x-decorator";

/**
 * Returns the matching Decorator for a Node that has a @custom[Element|Attribute] decorator
 * @param {Node|Decorator[]} node
 * @param {FoveaDecoratorCustomHostName} x
 * @returns {Decorator|undefined}
 */
export function getCustomXDecorator (node: Node|Decorator[], x: FoveaDecoratorCustomHostName): ICustomXDecorator|undefined {
	const decorators = Array.isArray(node) ? node : <ReadonlyArray<Decorator>|undefined>node.decorators;
	return decorators == null
		? undefined
		: decorators
			.map(decorator => ({decorator, x}))
			.find(isCustomXDecorator);
}