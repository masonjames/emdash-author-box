export const AUTHOR_BOX_LAYOUTS = ["compact", "expanded"] as const;
export const AUTHOR_BOX_LAYOUT_PREFERENCES = ["inherit", ...AUTHOR_BOX_LAYOUTS] as const;
export const VISIBILITY_OVERRIDES = ["inherit", "show", "hide"] as const;
export const CONTRIBUTORS_SCOPES = ["all", "primary-only"] as const;
export const CONTRIBUTOR_MODES = ["primary-first", "byline-order"] as const;

export type AuthorBoxLayout = (typeof AUTHOR_BOX_LAYOUTS)[number];
export type AuthorBoxLayoutPreference = (typeof AUTHOR_BOX_LAYOUT_PREFERENCES)[number];
export type VisibilityOverride = (typeof VISIBILITY_OVERRIDES)[number];
export type ContributorsScope = (typeof CONTRIBUTORS_SCOPES)[number];
export type ContributorMode = (typeof CONTRIBUTOR_MODES)[number];

export interface AuthorBoxSettings {
	showAvatar: boolean;
	showBio: boolean;
	showWebsite: boolean;
	defaultLayout: AuthorBoxLayout;
	contributorMode: ContributorMode;
}

export interface AuthorBoxBlock {
	_type: "authorBox";
	_key?: string;
	heading?: string;
	layout?: AuthorBoxLayoutPreference;
	bioVisibility?: VisibilityOverride;
	websiteVisibility?: VisibilityOverride;
	contributorsScope?: ContributorsScope;
}

export interface NormalizedContributor {
	id: string | null;
	name: string;
	bio: string | null;
	websiteUrl: string | null;
	websiteLabel: string | null;
	avatarUrl: string | null;
	initials: string | null;
	isPrimary: boolean;
}

export interface ResolvedAuthorBoxModel {
	heading: string | null;
	layout: "single" | AuthorBoxLayout;
	showAvatar: boolean;
	showBio: boolean;
	showWebsite: boolean;
	contributors: NormalizedContributor[];
	className: string | null;
}

export interface AuthorBoxProps {
	node?: Partial<AuthorBoxBlock> | null;
	content?: unknown;
	contributors?: unknown;
	authorBoxSettings?: Partial<AuthorBoxSettings> | null;
	heading?: string | null;
	layout?: AuthorBoxLayoutPreference | null;
	bioVisibility?: VisibilityOverride | null;
	websiteVisibility?: VisibilityOverride | null;
	contributorsScope?: ContributorsScope | null;
	class?: string | null;
	entry?: unknown;
	page?: unknown;
	pageCtx?: unknown;
	value?: unknown;
}

