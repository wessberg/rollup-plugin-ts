import {createHash, createHmac} from "crypto";

export interface GenerateRandomHashOptions {
	key: string;
	length: number;
}

/**
 * Generates a random hash
 */
export function generateRandomHash({length = 8, key}: Partial<GenerateRandomHashOptions> = {}): string {
	return key == null ? createHash("sha1").digest("hex").slice(0, length) : createHmac("sha1", key).digest("hex").slice(0, length);
}

export function generateRandomIntegerHash(options?: Partial<GenerateRandomHashOptions>, offset = 1000000): number {
	const str = generateRandomHash(options);

	let result = 0;
	for (let i = 0; i < str.length; i++) {
		result = result + str.charCodeAt(i);
	}

	return result + offset;
}
