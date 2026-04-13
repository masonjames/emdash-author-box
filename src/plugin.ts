import { definePlugin } from "emdash";

import { AUTHOR_BOX_PLUGIN_ID, AUTHOR_BOX_VERSION } from "./constants.js";
import type { AuthorBoxSettings, AuthorBoxLayout, ContributorMode } from "./types.js";
import {
	DEFAULT_AUTHOR_BOX_SETTINGS,
	getAuthorBoxAdminPages,
	getAuthorBoxPortableTextBlocks,
	getAuthorBoxSettingsSchema,
	getDefaultSettingEntries,
} from "./settings.js";

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseBoolean(value: unknown, fallback: boolean): boolean {
	if (typeof value === "boolean") return value;
	if (typeof value === "string") {
		const normalized = value.trim().toLowerCase();
		if (["true", "1", "yes", "on"].includes(normalized)) return true;
		if (["false", "0", "no", "off"].includes(normalized)) return false;
	}
	return fallback;
}

function parseDefaultLayout(value: unknown, fallback: AuthorBoxLayout): AuthorBoxLayout {
	return value === "compact" || value === "expanded" ? value : fallback;
}

function parseContributorMode(value: unknown, fallback: ContributorMode): ContributorMode {
	return value === "primary-first" || value === "byline-order" ? value : fallback;
}

async function loadSettings(ctx: {
	kv: { get(key: string): Promise<unknown | null> };
}): Promise<AuthorBoxSettings> {
	const [showAvatar, showBio, showWebsite, defaultLayout, contributorMode] = await Promise.all([
		ctx.kv.get("settings:showAvatar"),
		ctx.kv.get("settings:showBio"),
		ctx.kv.get("settings:showWebsite"),
		ctx.kv.get("settings:defaultLayout"),
		ctx.kv.get("settings:contributorMode"),
	]);

	return {
		showAvatar: parseBoolean(showAvatar, DEFAULT_AUTHOR_BOX_SETTINGS.showAvatar),
		showBio: parseBoolean(showBio, DEFAULT_AUTHOR_BOX_SETTINGS.showBio),
		showWebsite: parseBoolean(showWebsite, DEFAULT_AUTHOR_BOX_SETTINGS.showWebsite),
		defaultLayout: parseDefaultLayout(defaultLayout, DEFAULT_AUTHOR_BOX_SETTINGS.defaultLayout),
		contributorMode: parseContributorMode(contributorMode, DEFAULT_AUTHOR_BOX_SETTINGS.contributorMode),
	};
}

function normalizeSettingsInput(values: unknown, current: AuthorBoxSettings): AuthorBoxSettings {
	const input = isRecord(values) ? values : {};
	return {
		showAvatar: parseBoolean(input.showAvatar, current.showAvatar),
		showBio: parseBoolean(input.showBio, current.showBio),
		showWebsite: parseBoolean(input.showWebsite, current.showWebsite),
		defaultLayout: parseDefaultLayout(input.defaultLayout, current.defaultLayout),
		contributorMode: parseContributorMode(input.contributorMode, current.contributorMode),
	};
}

async function saveSettings(
	ctx: {
		kv: { set(key: string, value: unknown): Promise<void> };
	},
	settings: AuthorBoxSettings,
): Promise<void> {
	await Promise.all([
		ctx.kv.set("settings:showAvatar", settings.showAvatar),
		ctx.kv.set("settings:showBio", settings.showBio),
		ctx.kv.set("settings:showWebsite", settings.showWebsite),
		ctx.kv.set("settings:defaultLayout", settings.defaultLayout),
		ctx.kv.set("settings:contributorMode", settings.contributorMode),
	]);
}

function renderSettingsPage(settings: AuthorBoxSettings, toast?: { message: string; type: "success" | "error" }) {
	return {
		blocks: [
			{ type: "header", text: "Author Box" },
			{
				type: "context",
				text: "Configure default author box behavior for avatars, bios, links, layout, and contributor ordering.",
			},
			{
				type: "form",
				block_id: "author-box-settings",
				fields: [
					{
						type: "toggle",
						action_id: "showAvatar",
						label: "Show avatar",
						initial_value: settings.showAvatar,
					},
					{
						type: "toggle",
						action_id: "showBio",
						label: "Show bio",
						initial_value: settings.showBio,
					},
					{
						type: "toggle",
						action_id: "showWebsite",
						label: "Show website link",
						initial_value: settings.showWebsite,
					},
					{
						type: "select",
						action_id: "defaultLayout",
						label: "Default layout",
						initial_value: settings.defaultLayout,
						options: [
							{ value: "expanded", label: "Expanded cards" },
							{ value: "compact", label: "Compact list" },
						],
					},
					{
						type: "select",
						action_id: "contributorMode",
						label: "Contributor order",
						initial_value: settings.contributorMode,
						options: [
							{ value: "primary-first", label: "Primary contributor first" },
							{ value: "byline-order", label: "Keep EmDash byline order" },
						],
					},
				],
				submit: { label: "Save settings", action_id: "author_box_save_settings" },
			},
		],
		...(toast ? { toast } : {}),
	};
}

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
		routes: {
			admin: {
				handler: async (routeCtx) => {
					const input = isRecord(routeCtx.input) ? routeCtx.input : {};
					const interactionType = input.type;

					if (
						interactionType === "form_submit" &&
						input.action_id === "author_box_save_settings" &&
						"values" in input
					) {
						const currentSettings = await loadSettings(routeCtx);
						const nextSettings = normalizeSettingsInput(input.values, currentSettings);
						await saveSettings(routeCtx, nextSettings);
						return renderSettingsPage(nextSettings, {
							message: "Author Box settings saved.",
							type: "success",
						});
					}

					const currentSettings = await loadSettings(routeCtx);
					return renderSettingsPage(currentSettings);
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
