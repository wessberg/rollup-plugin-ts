import {Decorator, Node} from "typescript";
import {FoveaDecoratorCustomHostName} from "../../../../constant/constant";
import {getCustomXDecorator} from "../get/get-custom-x-decorator";

/**
 * Returns true if the given Node has a @custom[Element|Attribute] decorator
 * @param {Node|Decorator[]} node
 * @param {FoveaDecoratorCustomHostName} x
 * @returns {boolean}
 */
export function hasCustomXDecorator (node: Node|Decorator[], x: FoveaDecoratorCustomHostName): boolean {
	return getCustomXDecorator(node, x) != null;
}