/**
 * A CPS-compatible Map
 * @param {T[]} iterable
 * @param {(value: T, index: number, onNext: (value: U) => void) => void} callback
 * @param {(mapped: U[]) => void} onDone
 */
export function cpsMap<T, U> (iterable: (T[])|ReadonlyArray<T>, callback: (value: T, index: number, onNext: (value: U) => void) => void, onDone: (mapped: U[]) => void): void {
	const iterator = iterable[Symbol.iterator]();
	let index = 0;
	const mapped: U[] = [];

	(function recursiveStep () {
		const {done, value} = iterator.next();
		if (done) return onDone(mapped);
		const currentIndex = index;
		callback(value, index++, mappedValue => {
			mapped[currentIndex] = mappedValue;
			recursiveStep();
		});
	})();
}