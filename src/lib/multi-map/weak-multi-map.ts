import {MultiMap} from "./multi-map";

/**
 * A WeakMultiMap is like a MultiMap but where the keys are weak
 */
export class WeakMultiMap<K extends object, V, C extends V[] = V[]> extends MultiMap<K, V, C> {
	/**
	 * The inner WeakMap between keys and collections
	 * @template K, C
	 * @type {WeakMap<K, C>}
	 */
	protected readonly map: WeakMap<K, C> = new WeakMap();
}