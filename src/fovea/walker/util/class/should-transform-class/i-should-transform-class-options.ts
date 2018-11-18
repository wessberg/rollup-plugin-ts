import {ClassDeclaration, ClassExpression} from "typescript";
import {SourceFileContext} from "../../../shared/i-source-file-context";

export interface IShouldTransformClassOptions {
	node: ClassDeclaration|ClassExpression;
	context: SourceFileContext;
}