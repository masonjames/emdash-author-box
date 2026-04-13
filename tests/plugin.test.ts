import createPlugin from "../src/plugin.js";
import { DEFAULT_AUTHOR_BOX_SETTINGS } from "../src/settings.js";

describe("author box plugin runtime", () => {
	it("registers settings schema, settings route, and a single portable text block", () => {
		const plugin = createPlugin();

		expect(plugin.capabilities).toEqual([]);
		expect(plugin.admin.settingsSchema).toMatchObject({
			showAvatar: { type: "boolean", default: DEFAULT_AUTHOR_BOX_SETTINGS.showAvatar },
			showBio: { type: "boolean", default: DEFAULT_AUTHOR_BOX_SETTINGS.showBio },
			showWebsite: { type: "boolean", default: DEFAULT_AUTHOR_BOX_SETTINGS.showWebsite },
			defaultLayout: { type: "select", default: DEFAULT_AUTHOR_BOX_SETTINGS.defaultLayout },
			contributorMode: { type: "select", default: DEFAULT_AUTHOR_BOX_SETTINGS.contributorMode },
		});
		expect(plugin.routes.admin).toBeDefined();
		expect(plugin.admin.portableTextBlocks).toHaveLength(1);
		expect(plugin.admin.portableTextBlocks?.[0]).toMatchObject({
			type: "authorBox",
			label: "Author Box",
		});
	});

	it("seeds only missing defaults during install", async () => {
		const plugin = createPlugin();
		const store = new Map<string, unknown>([["settings:showBio", false]]);
		const writes: Array<[string, unknown]> = [];

		await plugin.hooks["plugin:install"]?.handler(
			{} as never,
			{
				kv: {
					get: async (key: string) => (store.has(key) ? store.get(key)! : null),
					set: async (key: string, value: unknown) => {
						store.set(key, value);
						writes.push([key, value]);
					},
				},
			} as never,
		);

		expect(store.get("settings:showBio")).toBe(false);
		expect(store.get("settings:showAvatar")).toBe(true);
		expect(store.get("settings:showWebsite")).toBe(true);
		expect(store.get("settings:defaultLayout")).toBe("expanded");
		expect(store.get("settings:contributorMode")).toBe("primary-first");
		expect(writes.some(([key]) => key === "settings:showBio")).toBe(false);
	});

	it("renders /settings and saves submitted settings to existing settings keys", async () => {
		const plugin = createPlugin();
		const store = new Map<string, unknown>([
			["settings:showAvatar", true],
			["settings:showBio", true],
			["settings:showWebsite", true],
			["settings:defaultLayout", "expanded"],
			["settings:contributorMode", "primary-first"],
		]);

		const page = (await plugin.routes.admin!.handler({
			input: { type: "page_load", page: "/settings" },
			kv: {
				get: async (key: string) => (store.has(key) ? store.get(key)! : null),
				set: async (key: string, value: unknown) => {
					store.set(key, value);
				},
			},
		} as never)) as { blocks: Array<Record<string, unknown>> };
		expect(page.blocks.some((block) => block.type === "form" && block.block_id === "author-box-settings")).toBe(true);

		const save = (await plugin.routes.admin!.handler({
			input: {
				type: "form_submit",
				action_id: "author_box_save_settings",
				values: {
					showAvatar: false,
					showBio: false,
					showWebsite: false,
					defaultLayout: "compact",
					contributorMode: "byline-order",
				},
			},
			kv: {
				get: async (key: string) => (store.has(key) ? store.get(key)! : null),
				set: async (key: string, value: unknown) => {
					store.set(key, value);
				},
			},
		} as never)) as { toast?: { type: string }; blocks: Array<Record<string, unknown>> };

		expect(save.toast?.type).toBe("success");
		expect(store.get("settings:showAvatar")).toBe(false);
		expect(store.get("settings:showBio")).toBe(false);
		expect(store.get("settings:showWebsite")).toBe(false);
		expect(store.get("settings:defaultLayout")).toBe("compact");
		expect(store.get("settings:contributorMode")).toBe("byline-order");
	});
});

