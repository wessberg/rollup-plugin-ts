/**
 * Returns true if the given type is callable
 * @param type
 * @returns {type is Function}
 */
export function isCallable (type: unknown): type is Function {
	return typeof type === "function";
}