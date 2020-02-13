export interface ContinuationOptions {
	lexicalEnvironment: LexicalEnvironment;
}

export interface LexicalEnvironmentBinding {
	value: string;
	originalSourceFileName: string;
}

export interface LexicalEnvironment {
	parent: LexicalEnvironment | undefined;
	bindings: Map<string, LexicalEnvironmentBinding>;
}

export interface DeconflicterOptions extends ContinuationOptions {}
