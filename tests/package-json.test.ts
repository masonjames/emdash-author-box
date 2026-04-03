import { readFileSync } from "node:fs";

const packageJson = JSON.parse(
	readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as Record<string, unknown>;

describe("package metadata", () => {
	it("exports the supported trusted-native entrypoints", () => {
		const exportsMap = packageJson.exports as Record<string, unknown>;
		expect(exportsMap["."]).toBeDefined();
		expect(exportsMap["./descriptor"]).toBeDefined();
		expect(exportsMap["./plugin"]).toBeDefined();
		expect(exportsMap["./astro"]).toBe("./src/astro/index.ts");
		expect(exportsMap["./sandbox"]).toBeUndefined();
	});

	it("is ready for public npm publication without broken marketplace scripts", () => {
		const publishConfig = packageJson.publishConfig as Record<string, unknown>;
		const scripts = packageJson.scripts as Record<string, unknown>;

		expect(publishConfig.access).toBe("public");
		expect(scripts.bundle).toBeUndefined();
		expect(scripts["publish:plugin"]).toBeUndefined();
	});
});

