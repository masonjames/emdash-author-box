import {
	AUTHOR_BOX_LAYOUT_PREFERENCES,
	AUTHOR_BOX_LAYOUTS,
	CONTRIBUTORS_SCOPES,
	type AuthorBoxBlock,
	type AuthorBoxLayout,
	type AuthorBoxLayoutPreference,
	type ContributorsScope,
	type VisibilityOverride,
	VISIBILITY_OVERRIDES,
} from "./types.js";

type UnknownRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is UnknownRecord {
	return typeof value === "object" && value !== null;
}

export function readString(value: unknown): string | null {
	return typeof value === "string" ? value : null;
}

export function cleanString(value: unknown): string | null {
	const stringValue = readString(value)?.trim();
	return stringValue ? stringValue : null;
}

export function sanitizeHttpUrl(value: unknown): string | null {
	const candidate = cleanString(value);
	if (!candidate) {
		return null;
	}

	try {
		const url = new URL(candidate);
		if (url.protocol !== "http:" && url.protocol !== "https:") {
			return null;
		}
		return url.toString();
	} catch {
		return null;
	}
}

export function normalizeAuthorBoxLayout(value: unknown): AuthorBoxLayout | null {
	return AUTHOR_BOX_LAYOUTS.includes(value as AuthorBoxLayout) ? (value as AuthorBoxLayout) : null;
}

export function normalizeAuthorBoxLayoutPreference(value: unknown): AuthorBoxLayoutPreference | null {
	return AUTHOR_BOX_LAYOUT_PREFERENCES.includes(value as AuthorBoxLayoutPreference)
		? (value as AuthorBoxLayoutPreference)
		: null;
}

export function normalizeVisibilityOverride(value: unknown): VisibilityOverride | null {
	return VISIBILITY_OVERRIDES.includes(value as VisibilityOverride)
		? (value as VisibilityOverride)
		: null;
}

export function normalizeContributorsScope(value: unknown): ContributorsScope | null {
	return CONTRIBUTORS_SCOPES.includes(value as ContributorsScope) ? (value as ContributorsScope) : null;
}

export function normalizeAuthorBoxBlock(value: unknown): Partial<AuthorBoxBlock> {
	if (!isRecord(value)) {
		return {};
	}

	return {
		heading: cleanString(value.heading) ?? undefined,
		layout: normalizeAuthorBoxLayoutPreference(value.layout) ?? undefined,
		bioVisibility: normalizeVisibilityOverride(value.bioVisibility) ?? undefined,
		websiteVisibility: normalizeVisibilityOverride(value.websiteVisibility) ?? undefined,
		contributorsScope: normalizeContributorsScope(value.contributorsScope) ?? undefined,
	};
}

