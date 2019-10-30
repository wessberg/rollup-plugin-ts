import {Resolver} from "../../../util/resolve-id/resolver";
import {NodeIdentifierCache} from "./util/get-identifiers-for-node";
import {ReferenceCache} from "./reference/cache/reference-cache";
import {Printer} from "typescript";

export interface DeclarationBundlerOptions {
	// A cache map between nodes and the identifier names for them
	nodeIdentifierCache: NodeIdentifierCache;
	// A cache map between nodes and whether or not they are referenced
	referenceCache: ReferenceCache;

	// A function that can resolve bare module specifiers
	resolver: Resolver;
	printer: Printer;

	relativeOutFileName: string;
	declarationFilename: string;
}
