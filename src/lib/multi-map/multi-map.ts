/**
 * A WeakMultiMap is a wrapper around a Map that assumes that all values are collections
 */
export class MultiMap<K, V, C extends V[] = V[]> {
	/**
	 * The inner Map between keys and collections
	 * @template K, C
	 * @type {WeakMap<K, C>}
	 */
		// @ts-ignore
	protected readonly map: Map<K, C>|WeakMap<K, C> = new Map();

	/**
	 * Gets the value for the given key. If it is not defined, it will initialize a new collection for it
	 * @template K, V, C
	 * @param {K} key
	 * @returns {C}
	 */
	public get (key: K): C {
		let match = this.map.get(key);
		if (match == null) {
			match = <C><unknown> [];
			this.map.set(key, match);
		}
		return match;
	}

	/**
	 * Pushes the given value to the collection for the given key
	 * @template K, V
	 * @param {K} key
	 * @param {V[]} value
	 * @returns {number}
	 */
	public add (key: K, ...value: V[]): void {
		const collection = this.get(key);
		collection.push(...value);
	}

	/**
	 * Deletes the value associated with the given key, K
	 * @template K
	 * @param {K} key
	 * @returns {boolean}
	 */
	public delete (key: K): boolean {
		return this.map.delete(key);
	}

	/**
	 * Returns true if the collection has the given key
	 * @template K
	 * @param {K} key
	 * @returns {boolean}
	 */
	public has (key: K): boolean {
		return this.map.has(key);
	}

	/**
	 * Returns true if the collection has the given value on the given key
	 * @template K, V
	 * @param {K} key
	 * @param {V} value
	 * @returns {boolean}
	 */
	public hasValue (key: K, value: V): boolean {
		if (!this.has(key)) return false;
		const collection = this.get(key);
		return collection.includes(value);
	}

	/**
	 * Finds a value in the collection matching the given key
	 * @template K, V
	 * @param {K} key
	 * @param {Function} callback
	 * @returns {boolean}
	 */
	public findValue<S extends V> (key: K, callback: (value: V, collection: C) => boolean): S|undefined {
		if (!this.has(key)) return undefined;
		const collection = this.get(key);
		for (const value of collection) {
			if (callback(value, collection)) return <S> value;
		}
		return undefined;
	}

	/**
	 * Returns true if any value matching the given key returns true from the callback
	 * @template K, V
	 * @param {K} key
	 * @param {Function} callback
	 * @returns {boolean}
	 */
	public someValue (key: K, callback: (value: V, collection: C) => boolean): boolean {
		return this.findValue(key, callback) != null;
	}

	/**
	 * Finds a value in the collection matching the given key
	 * @template K, V
	 * @param {K} key
	 * @param {Function} callback
	 * @returns {boolean}
	 */
	public mapValue<U> (key: K, callback: (value: V, collection: C) => U): U[] {
		if (!this.has(key)) return [];
		const collection = this.get(key);
		const mapped: U[] = [];
		let currentIndex = 0;
		for (const value of collection) {
			mapped[currentIndex++] = callback(value, collection);
		}
		return mapped;
	}

	/**
	 * Filters the values matching the given key
	 * @template K, V
	 * @param {K} key
	 * @param {Function} callback
	 * @returns {V[]}
	 */
	public filterValues (key: K, callback: (value: V, collection: C) => boolean): V[] {
		if (!this.has(key)) return [];
		const collection = this.get(key);
		const filtered: V[] = [];
		let currentIndex = 0;
		for (const value of collection) {
			if (callback(value, collection)) {
				filtered[currentIndex++] = value;
			}
		}
		return filtered;
	}

	/**
	 * Returns the amount of values that exists for the given key
	 * @template K
	 * @param {K} key
	 * @returns {number}
	 */
	public sizeForKey (key: K): number {
		if (!this.has(key)) return 0;
		return this.get(key).length;
	}

	/**
	 * Deletes the given value from the given key
	 * @template K, V
	 * @param {K} key
	 * @param {V} value
	 */
	public deleteValue (key: K, value: V): void {
		if (!this.has(key)) return;
		const collection = this.get(key);
		const index = collection.indexOf(value);
		if (index >= 0) collection.splice(index, 1);

		if (collection.length < 1) {
			this.delete(key);
		}
	}

	/**
	 * Pops all values for the provided key
	 * @template K, V
	 * @param {K} key
	 * @param {(item: V) => void} callback
	 */
	public popAll (key: K, callback: (item: V) => void): void {
		this.forEach(key, callback);
		this.delete(key);
	}

	/**
	 * Loops through all associated values for the given key
	 * @template K, V
	 * @param {K} key
	 * @param {(item: V) => void} callback
	 */
	public forEach (key: K, callback: (item: V) => void): void {
		// Do nothing if there are no collection associated with the key
		if (!this.has(key)) return;
		this.get(key).forEach(callback);
	}
}