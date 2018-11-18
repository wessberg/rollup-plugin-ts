import {ClassDeclaration, ClassExpression} from "typescript";

/**
 * Returns the name of the given class
 * @param {ClassDeclaration | ClassExpression} classDeclaration
 * @returns {string | undefined}
 */
export function getClassName (classDeclaration: ClassDeclaration|ClassExpression): string|undefined {
	return classDeclaration.name == null ? undefined : classDeclaration.name.text;
}