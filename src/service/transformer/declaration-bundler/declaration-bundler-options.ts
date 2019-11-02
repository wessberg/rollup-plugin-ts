import {DeclarationOptions} from "../declaration/declaration-options";

export interface DeclarationBundlerOptions extends DeclarationOptions {
	declarationFilename: string;
	localModuleNames: string[];
}
