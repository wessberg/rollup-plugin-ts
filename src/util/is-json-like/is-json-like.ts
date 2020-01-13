/**
 * Checks if the given piece of code is JSON-like
 */
export function isJsonLike(code: string): boolean {
	try {
		return JSON.parse(code) != null;
	} catch {
		return false;
	}
}
