// tslint:disable:no-any

export type Literal = any;

export const enum LiteralFlag {
	RETURN,
	BREAK,
	CONTINUE
}

export interface LiteralResult {
	value: Literal;
	flag?: LiteralFlag;
}