import type { PluginAdminPage, PortableTextBlockConfig, ResolvedPlugin } from "emdash";

import type { AuthorBoxSettings } from "./types.js";

type AuthorBoxSettingsSchema = NonNullable<ResolvedPlugin["admin"]["settingsSchema"]>;

export const DEFAULT_AUTHOR_BOX_SETTINGS: AuthorBoxSettings = {
	showAvatar: true,
	showBio: true,
	showWebsite: true,
	defaultLayout: "expanded",
	contributorMode: "primary-first",
};

const AUTHOR_BOX_SETTINGS_SCHEMA: AuthorBoxSettingsSchema = {
	showAvatar: {
		type: "boolean",
		label: "Show avatar",
		description: "Display contributor avatars or initials by default.",
		default: DEFAULT_AUTHOR_BOX_SETTINGS.showAvatar,
	},
	showBio: {
		type: "boolean",
		label: "Show bio",
		description: "Display contributor bios by default when available.",
		default: DEFAULT_AUTHOR_BOX_SETTINGS.showBio,
	},
	showWebsite: {
		type: "boolean",
		label: "Show website link",
		description: "Display contributor website links by default when available.",
		default: DEFAULT_AUTHOR_BOX_SETTINGS.showWebsite,
	},
	defaultLayout: {
		type: "select",
		label: "Default layout",
		description: "Choose the default layout for multi-contributor author boxes.",
		default: DEFAULT_AUTHOR_BOX_SETTINGS.defaultLayout,
		options: [
			{ value: "expanded", label: "Expanded cards" },
			{ value: "compact", label: "Compact list" },
		],
	},
	contributorMode: {
		type: "select",
		label: "Contributor order",
		description: "Decide whether the primary contributor should be highlighted first.",
		default: DEFAULT_AUTHOR_BOX_SETTINGS.contributorMode,
		options: [
			{ value: "primary-first", label: "Primary contributor first" },
			{ value: "byline-order", label: "Keep EmDash byline order" },
		],
	},
};

export function getAuthorBoxSettingsSchema(): AuthorBoxSettingsSchema {
	return structuredClone(AUTHOR_BOX_SETTINGS_SCHEMA);
}

export function getAuthorBoxAdminPages(): PluginAdminPage[] {
	return [{ path: "/settings", label: "Author Box" }];
}

export function getAuthorBoxPortableTextBlocks(): PortableTextBlockConfig[] {
	return [
		{
			type: "authorBox",
			label: "Author Box",
			description: "Render the current entry’s bylines as a polished author panel.",
			placeholder: "Add an author box for the current story.",
			fields: [
				{
					type: "text_input",
					action_id: "heading",
					label: "Heading",
					placeholder: "About the author",
				},
				{
					type: "select",
					action_id: "layout",
					label: "Layout",
					options: [
						{ value: "inherit", label: "Use site default" },
						{ value: "expanded", label: "Expanded cards" },
						{ value: "compact", label: "Compact list" },
					],
				},
				{
					type: "select",
					action_id: "bioVisibility",
					label: "Bio",
					options: [
						{ value: "inherit", label: "Use site default" },
						{ value: "show", label: "Always show" },
						{ value: "hide", label: "Always hide" },
					],
				},
				{
					type: "select",
					action_id: "websiteVisibility",
					label: "Website link",
					options: [
						{ value: "inherit", label: "Use site default" },
						{ value: "show", label: "Always show" },
						{ value: "hide", label: "Always hide" },
					],
				},
				{
					type: "select",
					action_id: "contributorsScope",
					label: "Contributors",
					options: [
						{ value: "all", label: "Show all contributors" },
						{ value: "primary-only", label: "Show primary contributor only" },
					],
				},
			],
		},
	];
}

export function getDefaultSettingEntries(): Array<[keyof AuthorBoxSettings, AuthorBoxSettings[keyof AuthorBoxSettings]]> {
	return Object.entries(DEFAULT_AUTHOR_BOX_SETTINGS) as Array<
		[keyof AuthorBoxSettings, AuthorBoxSettings[keyof AuthorBoxSettings]]
	>;
}
