export interface ContinuationOptions {
	lexicalEnvironment: LexicalEnvironment;
}

export interface LexicalEnvironment {
	parent: LexicalEnvironment | undefined;
	bindings: Map<string, string>;
}

export interface DeconflicterOptions extends ContinuationOptions {}
