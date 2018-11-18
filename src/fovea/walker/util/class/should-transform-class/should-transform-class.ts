import {IShouldTransformClassOptions} from "./i-should-transform-class-options";
import {getCustomXDecorator} from "../../decorator/get/get-custom-x-decorator";
import {validateCustomXDecorators} from "../../../validator/decorator/validate-custom-x-decorators";

/**
 * Returns true if the given options represent a class that should and could be transformed with Fovea
 * @param {IShouldTransformClassOptions} options
 * @returns {boolean}
 */
export function shouldTransformClass ({node, context}: IShouldTransformClassOptions): boolean {
	const customElementDecorator = getCustomXDecorator(node, "customElement");
	const customAttributeDecorator = getCustomXDecorator(node, "customAttribute");

	// Add diagnostics for them
	context.addDiagnostics(
		...validateCustomXDecorators(context, customElementDecorator, customAttributeDecorator)
	);

	// TODO: Also check that these decorators come from Fovea. Otherwise we may end up compiling non-related files, for examples LitElement instances (which also uses these kind of decorators)
	// TODO: Also include if it it includes other Fovea-specific decorators since we may still want to transform classes that will be subclassed, for example abstract base components which may intentionally not call customElements.define
	return customElementDecorator != null || customAttributeDecorator != null;
}