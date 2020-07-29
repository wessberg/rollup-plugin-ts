// A Record from chunk file names to their stats
export type DeclarationStats = Record<string, DeclarationChunkStats>;

export interface DeclarationChunkStats {
	// An array of the external type dependencies for a declaration chunk
	externalTypes: ExternalType[];
}

export interface ExternalType {
	// The name of the external library that provides the typings. For example, "typescript" or "@types/node"
	library: string;
	// The version of the referenced external library
	version: string;
}
