import {FoveaHostKind} from "@fovea/common";

/**
 * Stringifies a host kind so it is humanly readable
 * @param {FoveaHostKind} hostKind
 * @returns {string}
 */
export function stringifyHostKind (hostKind: FoveaHostKind|string): string {
	return hostKind === FoveaHostKind.CUSTOM_ELEMENT ? "custom element" : hostKind === FoveaHostKind.CUSTOM_ATTRIBUTE ? "custom attribute" : hostKind;
}