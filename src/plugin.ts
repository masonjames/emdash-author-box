import { definePlugin } from "emdash";

import { AUTHOR_BOX_PLUGIN_ID, AUTHOR_BOX_VERSION } from "./constants.js";
import {
	getAuthorBoxAdminPages,
	getAuthorBoxPortableTextBlocks,
	getAuthorBoxSettingsSchema,
	getDefaultSettingEntries,
} from "./settings.js";

export function createPlugin() {
	return definePlugin({
		id: AUTHOR_BOX_PLUGIN_ID,
		version: AUTHOR_BOX_VERSION,
		capabilities: [],
		hooks: {
			"plugin:install": {
				handler: async (
					_event: unknown,
					ctx: { kv: { get(key: string): Promise<unknown | null>; set(key: string, value: unknown): Promise<void> } },
				) => {
					for (const [key, value] of getDefaultSettingEntries()) {
						const settingKey = `settings:${String(key)}`;
						const existing = await ctx.kv.get(settingKey);
						if (existing === null) {
							await ctx.kv.set(settingKey, value);
						}
					}
				},
			},
		},
		admin: {
			settingsSchema: getAuthorBoxSettingsSchema(),
			pages: getAuthorBoxAdminPages(),
			portableTextBlocks: getAuthorBoxPortableTextBlocks(),
		},
	});
}

export default createPlugin;

