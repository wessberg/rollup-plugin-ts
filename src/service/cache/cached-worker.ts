export interface CachedWorkerOptions {}

export class CachedWorker<Options extends CachedWorkerOptions> {
	private readonly cache = new Map<string, unknown>();

	constructor(protected readonly options: Options) {}

	work<T>(key: string, job: () => T): T {
		if (this.cache.has(key)) {
			return this.cache.get(key) as T;
		}
		const result = job();
		this.cache.set(key, result);
		return result;
	}

	delete(key: string): boolean {
		return this.cache.delete(key);
	}
}
