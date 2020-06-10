import {D_TS_EXTENSION, JS_EXTENSION, JSON_EXTENSION, JSX_EXTENSION, MJS_EXTENSION, MJSX_EXTENSION, TS_EXTENSION, TSX_EXTENSION} from "../../constant/constant";

export type SupportedExtensions = Set<string>;

/**
 * Gets the extensions that are supported by Typescript, depending on whether or not to allow JS and JSON
 */
export function getSupportedExtensions(allowJs: boolean, allowJson: boolean): SupportedExtensions {
	return new Set([
		TS_EXTENSION,
		TSX_EXTENSION,
		D_TS_EXTENSION,
		...(allowJs ? [JS_EXTENSION, JSX_EXTENSION, MJS_EXTENSION, MJSX_EXTENSION] : []),
		...(allowJson ? [JSON_EXTENSION] : [])
	]);
}
