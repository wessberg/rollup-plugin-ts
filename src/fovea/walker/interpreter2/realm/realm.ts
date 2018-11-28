// tslint:disable:no-any

// tslint:disable:no-require-imports

// tslint:disable:variable-name

/**
 * Returns a concrete implementation of the Realm object
 * @returns {*}
 * @constructor
 */
export const RealmImplementation: any = (() => {
	try {
		// @ts-ignore
		return Realm;
	} catch {
		return require("ecma-proposal-realms");
	}
})();