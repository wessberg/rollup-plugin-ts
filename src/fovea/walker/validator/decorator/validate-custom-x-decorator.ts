import {isCallExpression, isClassDeclaration, isClassExpression, SyntaxKind} from "typescript";
import {FoveaDiagnostic} from "../../../diagnostic/fovea-diagnostic";
import {createFoveaDiagnostic} from "../../../diagnostic/create-fovea-diagnostic";
import {FoveaDiagnosticKind} from "../../../diagnostic/fovea-diagnostic-kind";
import {getClassName} from "../../util/class/get-class-name/get-class-name";
import {isAbstract} from "../../util/modifier/is/is-abstract";
import {ICustomXDecorator} from "../../util/decorator/i-custom-x-decorator";
import {containsWhitespace, isLowerCase} from "@wessberg/stringutil";
import {FoveaHostKind} from "@fovea/common";
import {SourceFileContext} from "../../shared/i-source-file-context";
import {evaluate} from "../../interpreter/evaluate";

/**
 * Validates the given @custom[Element|Attribute] decorator and retrieves an array of diagnostics for it
 * @param {SourceFileContext} context
 * @param {ICustomXDecorator} options
 * @returns {ReadonlyArray<FoveaDiagnostic>}
 */
export function validateCustomXDecorator (context: SourceFileContext, {decorator, x}: ICustomXDecorator): ReadonlyArray<FoveaDiagnostic> {
	const diagnostics: FoveaDiagnostic[] = [];

	const baseDiagnostic = {
		file: decorator.getSourceFile(),
		start: decorator.pos,
		length: decorator.end - decorator.pos
	};

	// Make sure that the decorator annotates a class
	if (!isClassDeclaration(decorator.parent) && !isClassExpression(decorator.parent)) {

		diagnostics.push(
			createFoveaDiagnostic(
				x === "customElement"
					? {
						...baseDiagnostic,
						code: FoveaDiagnosticKind.INVALID_CUSTOM_ELEMENT_DECORATOR_PLACEMENT,
						placement: decorator.parent.kind
					}
					: {
						...baseDiagnostic,
						code: FoveaDiagnosticKind.INVALID_CUSTOM_ATTRIBUTE_DECORATOR_PLACEMENT,
						placement: decorator.parent.kind
					}
			)
		);
	}

	else {
		// Make sure that the decorator is a CallExpression (e.g. that it is invoked)
		if (!isCallExpression(decorator.expression)) {
			diagnostics.push(
				createFoveaDiagnostic(
					x === "customElement"
						? {
							...baseDiagnostic,
							code: FoveaDiagnosticKind.INVALID_CUSTOM_ELEMENT_DECORATOR_NOT_CALLED,
							hostName: getClassName(decorator.parent)
						}
						: {
							...baseDiagnostic,
							code: FoveaDiagnosticKind.INVALID_CUSTOM_ATTRIBUTE_DECORATOR_NOT_CALLED,
							hostName: getClassName(decorator.parent)
						}
				)
			);
		}

		// Make sure that the decorator receives at least one argument
		else if (decorator.expression.arguments.length < 1) {
			diagnostics.push(
				createFoveaDiagnostic(
					x === "customElement"
						? {
							...baseDiagnostic,
							code: FoveaDiagnosticKind.INVALID_CUSTOM_ELEMENT_DECORATOR_NO_ARGUMENTS,
							hostName: getClassName(decorator.parent)
						}
						: {
							...baseDiagnostic,
							code: FoveaDiagnosticKind.INVALID_CUSTOM_ATTRIBUTE_DECORATOR_NO_ARGUMENTS,
							hostName: getClassName(decorator.parent)
						}
				)
			);
		}

		else {
			const firstArgument = decorator.expression.arguments[0];
			const firstArgumentBaseDiagnostic = {
				...baseDiagnostic,
				start: firstArgument.pos,
				length: firstArgument.end - firstArgument.pos
			};

			// Attempt to resolve a literal value for that expression
			const literal = evaluate({context, node: firstArgument, deterministic: true, maxOps: 3000});
			console.log({literal});

			if (!literal.success) {
				diagnostics.push(
					createFoveaDiagnostic(
						x === "customElement"
							? {
								...firstArgumentBaseDiagnostic,
								code: FoveaDiagnosticKind.INVALID_CUSTOM_ELEMENT_DECORATOR_NOT_STATICALLY_ANALYZABLE,
								hostName: getClassName(decorator.parent)
							}
							: {
								...baseDiagnostic,
								code: FoveaDiagnosticKind.INVALID_CUSTOM_ATTRIBUTE_DECORATOR_NOT_STATICALLY_ANALYZABLE,
								hostName: getClassName(decorator.parent)
							}
					)
				);
			}

			else if (typeof literal.value !== "string") {
				diagnostics.push(
					createFoveaDiagnostic(
						x === "customElement"
							? {
								...firstArgumentBaseDiagnostic,
								code: FoveaDiagnosticKind.INVALID_CUSTOM_ELEMENT_DECORATOR_FIRST_ARGUMENT_MUST_BE_A_STRING,
								hostName: getClassName(decorator.parent)
							}
							: {
								...baseDiagnostic,
								code: FoveaDiagnosticKind.INVALID_CUSTOM_ATTRIBUTE_DECORATOR_FIRST_ARGUMENT_MUST_BE_A_STRING,
								hostName: getClassName(decorator.parent)
							}
					)
				);
			}

			// Make sure that the selector doesn't include whitespace.
			else if (containsWhitespace(literal.value)) {
				diagnostics.push(
					createFoveaDiagnostic(
						{
							...firstArgumentBaseDiagnostic,
							code: FoveaDiagnosticKind.INVALID_SELECTOR_HAS_WHITESPACE,
							hostName: getClassName(decorator.parent),
							hostKind: x === "customElement" ? FoveaHostKind.CUSTOM_ELEMENT : FoveaHostKind.CUSTOM_ATTRIBUTE,
							selector: literal.value
						}
					)
				);
			}

			// Apply additional checks for Custom Elements to make sure they respect Custom Element semantics
			else if (x === "customElement") {

				// Custom Element selectors *must* include a hyphen ("-")
				if (!literal.value.includes("-")) {
					diagnostics.push(
						createFoveaDiagnostic(
							{
								...firstArgumentBaseDiagnostic,
								code: FoveaDiagnosticKind.INVALID_SELECTOR_NEEDS_HYPHEN,
								hostName: getClassName(decorator.parent),
								hostKind: FoveaHostKind.CUSTOM_ELEMENT,
								selector: literal.value
							}
						)
					);
				}

				// Custom Element selectors *must* be all lower-case
				else if (!isLowerCase(literal.value)) {
					diagnostics.push(
						createFoveaDiagnostic(
							{
								...firstArgumentBaseDiagnostic,
								code: FoveaDiagnosticKind.INVALID_SELECTOR_IS_NOT_ALL_LOWER_CASE,
								hostName: getClassName(decorator.parent),
								hostKind: FoveaHostKind.CUSTOM_ELEMENT,
								selector: literal.value
							}
						)
					);
				}
			}
		}

		// Make sure the parent class isn't abstract
		if (isAbstract(decorator.parent)) {
			const {pos, end} = decorator.parent.modifiers!.find(modifier => modifier.kind === SyntaxKind.AbstractKeyword)!;
			const parentBaseDiagnostic = {
				...baseDiagnostic,
				start: pos,
				length: end - pos
			};
			diagnostics.push(
				createFoveaDiagnostic(
					x === "customElement"
						? {
							...parentBaseDiagnostic,
							code: FoveaDiagnosticKind.INVALID_CUSTOM_ELEMENT_DECORATOR_CLASS_MUST_NOT_BE_ABSTRACT,
							hostName: getClassName(decorator.parent)
						}
						: {
							...baseDiagnostic,
							code: FoveaDiagnosticKind.INVALID_CUSTOM_ATTRIBUTE_DECORATOR_CLASS_MUST_NOT_BE_ABSTRACT,
							hostName: getClassName(decorator.parent)
						}
				)
			);
		}
	}

	return diagnostics;
}