/**
 * Calculates Levenshtein distance
 */
export function similarity(a: string, b: string): number {
	let tmp: number | string | undefined;
	if (a.length === 0) {
		return b.length;
	}
	if (b.length === 0) {
		return a.length;
	}

	if (a.length > b.length) {
		tmp = a;
		a = b;
		b = tmp;
	}

	let i = 0;
	let j = 0;
	let res = 0;
	const alen = a.length;
	const blen = b.length;
	const row: number[] = Array(alen);
	for (i = 0; i <= alen; i++) {
		row[i] = i;
	}

	for (i = 1; i <= blen; i++) {
		res = i;
		for (j = 1; j <= alen; j++) {
			tmp = row[j - 1];
			row[j - 1] = res;
			res = b[i - 1] === a[j - 1] ? tmp : Math.min(tmp + 1, Math.min(res + 1, row[j] + 1));
		}
	}
	return res;
}
