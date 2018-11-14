import {IReferencedCustomSelector} from "@fovea/dom";

export interface IDeclaredCustomSelector extends IReferencedCustomSelector {
	hostName: string;
	isDefaultExport: boolean;
	isNamedExport: boolean;
	file: string;
}