import osModule from "os";

export type OS = Pick<typeof osModule, "platform" | "EOL">;
