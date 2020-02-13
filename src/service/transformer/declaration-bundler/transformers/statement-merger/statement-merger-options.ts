export interface StatementMergerOptions {
	// For files with no imports and exports, an empty 'export {}' can be added to mark the file as a module.
	// Setting this property to 'false' disables that behavior
	markAsModuleIfNeeded: boolean;
}
