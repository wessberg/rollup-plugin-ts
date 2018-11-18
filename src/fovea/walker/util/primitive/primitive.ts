export type PrimitiveType = string|number|boolean|undefined|null|symbol;

/**
 * Returns true if the given type is a primitive type
 * @param {string} type
 * @returns {type is PrimitiveType}
 */
export function isPrimitiveType (type: unknown): type is PrimitiveType {
	if (type === null) return true;

	const typeofResult = typeof type;
	switch (typeofResult) {
		case "string":
		case "number":
		case "boolean":
		case "undefined":
		case "symbol":
			return true;
		default:
			return false;
	}
}