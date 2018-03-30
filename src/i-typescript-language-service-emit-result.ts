export enum TypescriptLanguageServiceEmitResultKind {
	MAP, DECLARATION, SOURCE
}

export interface ITypescriptLanguageServiceEmitResult {
	kind: TypescriptLanguageServiceEmitResultKind;
	fileName: string;
	isMainEntry: boolean;
	text: string;
}