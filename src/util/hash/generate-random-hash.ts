import {createHash} from "crypto";

/**
 * Generates a random hash
 * @returns {string}
 */
export function generateRandomHash (): string {
	return createHash("md5").digest("base64");
}