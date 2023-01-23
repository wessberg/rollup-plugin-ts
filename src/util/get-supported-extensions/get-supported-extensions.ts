import type {
	KnownExtension,
	AmbientExtension} from "../../constant/constant.js";
import {
	D_TS_EXTENSION,
	JS_EXTENSION,
	JSON_EXTENSION,
	JSX_EXTENSION,
	TS_EXTENSION,
	TSX_EXTENSION,
	D_CTS_EXTENSION,
	D_MTS_EXTENSION,
	MJS_EXTENSION,
	MJSX_EXTENSION,
	CJS_EXTENSION,
	CJSX_EXTENSION,
	MTS_EXTENSION,
	CTS_EXTENSION,
	MTSX_EXTENSION,
	CTSX_EXTENSION
} from "../../constant/constant.js";
import type {TS} from "../../type/ts.js";

export type SupportedExtensions = Set<KnownExtension>;
export type SupportedAmbientExtensions = Set<AmbientExtension>;

/**
 * Gets the extensions that are supported by Typescript, depending on whether or not to allow JS and JSON
 */
export function getSupportedExtensions(allowJs: boolean, allowJson: boolean, typescript: typeof TS): SupportedExtensions {
	// If the TypeScript version supports Node16 as a module resolution target,
	// it also supports some additional formats such as .mts, .cts, .cjs, .d.cts, .mjs, .d.mts, .cjsx, and .mjsx
	if (typescript.ModuleResolutionKind.Node16 != null) {
		return new Set([
			TS_EXTENSION,
			MTS_EXTENSION,
			MTSX_EXTENSION,
			CTS_EXTENSION,
			CTSX_EXTENSION,
			TSX_EXTENSION,
			D_TS_EXTENSION,
			D_CTS_EXTENSION,
			D_MTS_EXTENSION,
			...(allowJs ? ([JS_EXTENSION, JSX_EXTENSION, MJS_EXTENSION, MJSX_EXTENSION, CJS_EXTENSION, CJSX_EXTENSION] as const) : []),
			...(allowJson ? ([JSON_EXTENSION] as const) : [])
		] as const);
	}
	return new Set([
		TS_EXTENSION,
		TSX_EXTENSION,
		D_TS_EXTENSION,
		...(allowJs ? ([JS_EXTENSION, JSX_EXTENSION] as const) : []),
		...(allowJson ? ([JSON_EXTENSION] as const) : [])
	] as const);
}
