import { readFileSync } from "node:fs";

describe("astro registry export", () => {
	it("declares the authorBox block component registry", () => {
		const source = readFileSync(new URL("../src/astro/index.ts", import.meta.url), "utf8");
		expect(source).toContain("AuthorBoxComponent as authorBox");
		expect(source).toContain("AuthorBoxComponent as AuthorBox");
		expect(source).toContain("authorBox: AuthorBoxComponent");
	});
});

