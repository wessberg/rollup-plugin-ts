import {TS} from "../../../../../type/ts";

export function getInnerSourceFileStatements(sourceFile: TS.SourceFile | undefined, typescript: typeof TS): TS.Statement[] {
	const statements: TS.Statement[] = [];
	if (sourceFile == null) return statements;

	for (const outerStatement of sourceFile.statements) {
		if (typescript.isModuleDeclaration(outerStatement)) {
			if (outerStatement.body != null && typescript.isModuleBlock(outerStatement.body)) {
				statements.push(...outerStatement.body.statements);
			}
		} else {
			statements.push(outerStatement);
		}
	}

	return statements;
}
