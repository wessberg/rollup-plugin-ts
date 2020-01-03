export interface VirtualFileInput {
	fileName: string;
	text: string;
	fromRollup: boolean;
}

export interface VirtualFile extends VirtualFileInput {
	transformedText: string;
}
