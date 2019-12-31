export interface ResolverResult {
	fileName: string;
	isExternalLibrary: boolean;
}

export type Resolver = (id: string, parent: string | undefined) => ResolverResult | undefined;
