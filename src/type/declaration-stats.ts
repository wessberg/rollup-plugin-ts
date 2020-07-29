export interface DeclarationStats {
	// A Record from chunk file names to their external type dependencies
	externalTypes: Record<string, ExternalType[]>;
}

export interface ExternalType {
	// The name of the external library that provides the typings. For example, "typescript" or "@types/node"
	library: string;
	// The version of the referenced external library
	version: string;
}
