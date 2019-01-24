/**
 * Swaps the casing of the given string
 * @param {string} s
 * @returns {string}
 */
export function swapCase(s: string): string {
	return s.replace(/\w/g, function(ch) {
		const up = ch.toUpperCase();
		return ch === up ? ch.toLowerCase() : up;
	});
}
