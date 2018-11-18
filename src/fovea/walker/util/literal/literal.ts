// tslint:disable:no-any
import {isPrimitiveType} from "../primitive/primitive";

export interface Literal {
	___literal: true;
	value: any;
}

export type LiteralResult = Literal|undefined;

export function createLiteral (ctor: Literal["value"]): Literal {
	return {
		___literal: true,
		value: ctor.value
	};
}

/**
 * Returns true if the given type is a Literal
 * @param type
 * @returns {type is Literal}
 */
export function isLiteral (type: unknown): type is Literal {
	return !isPrimitiveType(type) && "___literal" in <{}>type;
}

/**
 * Takes the value of the given literal if it is one, otherwise it returns the given input as-is
 * @param {?} type
 * @returns {*}
 */
export function takeLiteralValueIfLiteral (type: unknown): any {
	if (isLiteral(type)) return type.value;
	return type;
}