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
