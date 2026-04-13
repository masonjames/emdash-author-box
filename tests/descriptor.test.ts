import { readFileSync } from "node:fs";

import authorBoxPlugin, { authorBoxPlugin as namedAuthorBoxPlugin } from "../src/index.js";
import {
	AUTHOR_BOX_COMPONENTS_ENTRYPOINT,
	AUTHOR_BOX_PLUGIN_ENTRYPOINT,
	AUTHOR_BOX_PLUGIN_ID,
	AUTHOR_BOX_VERSION,
} from "../src/constants.js";

describe("authorBoxPlugin descriptor", () => {
	it("exports the descriptor as both named and default exports", () => {
		expect(authorBoxPlugin()).toEqual(namedAuthorBoxPlugin());
	});

	it("declares a trusted native plugin with the expected entrypoints", () => {
		expect(authorBoxPlugin()).toMatchObject({
			id: AUTHOR_BOX_PLUGIN_ID,
			version: AUTHOR_BOX_VERSION,
			format: "native",
			entrypoint: AUTHOR_BOX_PLUGIN_ENTRYPOINT,
			componentsEntry: AUTHOR_BOX_COMPONENTS_ENTRYPOINT,
			adminPages: [{ path: "/settings", label: "Author Box" }],
		});
		expect(AUTHOR_BOX_PLUGIN_ENTRYPOINT).toBe("emdash-author-box/plugin");
		expect(AUTHOR_BOX_COMPONENTS_ENTRYPOINT).toBe("emdash-author-box/astro");
	});

	it("does not declare sandbox-only capabilities or storage", () => {
		const descriptor = authorBoxPlugin();
		expect(descriptor.capabilities).toEqual([]);
		expect(descriptor.storage).toBeUndefined();
		expect(descriptor.allowedHosts).toEqual([]);
	});

	it("keeps package plugin.id in sync", () => {
		const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as {
			plugin?: { id?: string };
		};
		expect(pkg.plugin?.id).toBe(AUTHOR_BOX_PLUGIN_ID);
	});
});

