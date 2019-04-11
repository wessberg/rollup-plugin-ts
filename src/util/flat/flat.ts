// tslint:disable:array-type

export declare type Flat<A> = A extends Array<infer B>
	? B extends Array<infer C>
		? C extends Array<infer D>
			? D extends Array<infer E>
				? E extends Array<infer F>
					? F extends Array<infer G>
						? G extends Array<infer H>
							? H extends Array<infer I>
								? I extends Array<infer J>
									? J extends Array<infer K>
										? K extends Array<infer L>
											? L extends Array<infer M>
												? M extends Array<infer N>
													? M
													: L
												: K
											: J
										: I
									: H
								: G
							: F
						: E
					: D
				: C
			: B
		: A
	: A;

// tslint:disable:no-any

/**
 * Flattens the array with the given recursive depth
 * @param {T[]} arr
 * @returns {T[]}
 */
export function flat<T>(arr: T): Flat<T> {
	const target: any[] = [];
	if (!Array.isArray(arr)) return <Flat<T>>arr;

	flattenIntoArray(target, arr, Infinity);
	return <Flat<T>>(<any>target);
}

/**
 * Flattens the given source array into a new array
 * @param {T[]} target
 * @param {T[]} source
 * @param {number} [depth=1]
 * @param {number} [start=0]
 * @returns {number}
 */
function flattenIntoArray<T>(target: T[], source: T[], depth: number = 1, start: number = 0): number {
	let targetIndex = start;
	let sourceIndex = 0;
	const sourceLength = source.length;
	while (sourceIndex < sourceLength) {
		const element = source[sourceIndex];

		if (depth > 0 && Array.isArray(element)) {
			targetIndex = flattenIntoArray(target, element, depth - 1, targetIndex);
		} else {
			target[targetIndex] = element;
			targetIndex++;
		}
		sourceIndex++;
	}
	return targetIndex;
}
