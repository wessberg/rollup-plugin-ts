/**
 * A CPS-compatible forEach
 * @param {Iterable<T>} iterable
 * @param {(value: T, index: number, iterable: Iterable<T>) => void} callback
 * @param {Function} onDone
 */
export function cpsForeach<T> (iterable: Iterable<T>, callback: (value: T, index: number, onNext: () => void, done?: Function) => void, onDone: Function): void {
	const iterator = iterable[Symbol.iterator]();
	let index = 0;

	(function recursiveStep () {
		const {done, value} = iterator.next();
		if (done) return onDone();
		callback(value, index++, recursiveStep, onDone);
	})();
}