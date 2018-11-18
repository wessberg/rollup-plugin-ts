import {isClassDeclaration, isClassExpression} from "typescript";
import {FoveaDiagnostic} from "../../../diagnostic/fovea-diagnostic";
import {createFoveaDiagnostic} from "../../../diagnostic/create-fovea-diagnostic";
import {FoveaDiagnosticKind} from "../../../diagnostic/fovea-diagnostic-kind";
import {getClassName} from "../../util/class/get-class-name/get-class-name";
import {ICustomXDecorator} from "../../util/decorator/i-custom-x-decorator";
import {validateCustomXDecorator} from "./validate-custom-x-decorator";
import {SourceFileContext} from "../../shared/i-source-file-context";

/**
 * Validates the given @custom[Element|Attribute] decorators and retrieves an array of diagnostics for it
 * @param {SourceFileContext} context
 * @param {ICustomXDecorator[]} customXDecorators
 * @returns {ReadonlyArray<FoveaDiagnostic>}
 */
export function validateCustomXDecorators (context: SourceFileContext, ...customXDecorators: (ICustomXDecorator|undefined)[]): ReadonlyArray<FoveaDiagnostic> {
	const definedDecorators = <ICustomXDecorator[]> customXDecorators.filter(customXDecorator => customXDecorator != null);
	const diagnostics: FoveaDiagnostic[] = [].concat.apply([], definedDecorators.map(definedDecorator => validateCustomXDecorator(context, definedDecorator)));
	const [{decorator}] = definedDecorators;

	// The start is the start of the first decorator within the file
	const start = definedDecorators
		.map((definedDecorator) => definedDecorator.decorator.pos)
		.reduce((prev, cur) => prev < cur ? prev : cur);

	// The end is the end of the last decorator within the file
	const end = definedDecorators
		.map((definedDecorator) => definedDecorator.decorator.end)
		.reduce((prev, cur) => prev > cur ? prev : cur);

	// The length is equal to the difference between the end position of the last decorator and the start position of the first decorator
	const length = end - start;

	// Make sure that there can only be one @custom[Element|Attribute] decorator
	if ((isClassDeclaration(decorator.parent) || isClassExpression(decorator.parent)) && definedDecorators.length > 1) {
		diagnostics.push(
			createFoveaDiagnostic(
				{
					file: decorator.getSourceFile(),
					start,
					length,
					code: FoveaDiagnosticKind.AMBIGUOUS_HOST,
					hostName: getClassName(decorator.parent)
				}
			)
		);
	}

	return diagnostics;
}