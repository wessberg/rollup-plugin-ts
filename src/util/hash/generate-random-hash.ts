import {createHash} from "crypto";

/**
 * Generates a random hash
 */
export function generateRandomHash(kind: "hex" | "base64" = "base64"): string {
	return createHash("md5").digest(kind);
}
