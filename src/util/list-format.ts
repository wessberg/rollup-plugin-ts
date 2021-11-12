/**
 * Formats the given iterable of strings in a list format (in the English locale)
 */
export function listFormat(elements: Iterable<string>, andOrOr: "and" | "or" = "and", mapper: (element: string) => string = element => element): string {
	const arr = [...elements];
	if (arr.length === 0) return "";
	else if (arr.length === 1) return mapper(arr[0]);
	else if (arr.length === 2) {
		const [first, last] = arr;
		return `${mapper(first)} ${andOrOr} ${mapper(last)}`;
	} else {
		const head = arr.slice(0, arr.length - 1).map(mapper);
		const last = mapper(arr.slice(-1)[0]);
		return `${head.join(", ")}, ${andOrOr} ${last}`;
	}
}
