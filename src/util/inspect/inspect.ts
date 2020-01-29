import {inspect as _inspect} from "util";

export function inspect<T>(item: T, depth = 4): void {
	console.log(_inspect(item, {colors: true, depth, maxArrayLength: 1000}));
}
