import { DEFAULT_AUTHOR_BOX_SETTINGS } from "./settings.js";
import {
	cleanString,
	isRecord,
	normalizeAuthorBoxBlock,
	normalizeAuthorBoxLayoutPreference,
	normalizeContributorsScope,
	normalizeVisibilityOverride,
	sanitizeHttpUrl,
} from "./schemas.js";
import {
	AUTHOR_BOX_HEADING_LEVELS,
	type AuthorBoxHeadingLevel,
	type AuthorBoxLayout,
	type AuthorBoxProps,
	type AuthorBoxSettings,
	type ContributorMode,
	type ContributorsScope,
	type NormalizedContributor,
	type ResolvedAuthorBoxModel,
	type VisibilityOverride,
} from "./types.js";

function resolveBooleanSetting(value: unknown, fallback: boolean): boolean {
	return typeof value === "boolean" ? value : fallback;
}

function resolveStringSetting<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
	return allowed.includes(value as T) ? (value as T) : fallback;
}

function resolveHeadingLevel(value: unknown): AuthorBoxHeadingLevel {
	return resolveStringSetting(value, AUTHOR_BOX_HEADING_LEVELS, "p");
}

export function resolveAuthorBoxSettings(overrides?: Partial<AuthorBoxSettings> | null): AuthorBoxSettings {
	return {
		showAvatar: resolveBooleanSetting(overrides?.showAvatar, DEFAULT_AUTHOR_BOX_SETTINGS.showAvatar),
		showBio: resolveBooleanSetting(overrides?.showBio, DEFAULT_AUTHOR_BOX_SETTINGS.showBio),
		showWebsite: resolveBooleanSetting(overrides?.showWebsite, DEFAULT_AUTHOR_BOX_SETTINGS.showWebsite),
		defaultLayout: resolveStringSetting(
			overrides?.defaultLayout,
			["compact", "expanded"] as const,
			DEFAULT_AUTHOR_BOX_SETTINGS.defaultLayout,
		),
		contributorMode: resolveStringSetting(
			overrides?.contributorMode,
			["primary-first", "byline-order"] as const,
			DEFAULT_AUTHOR_BOX_SETTINGS.contributorMode,
		),
	};
}

function resolveVisibility(defaultValue: boolean, override: VisibilityOverride | null): boolean {
	if (override === "show") {
		return true;
	}
	if (override === "hide") {
		return false;
	}
	return defaultValue;
}

function readNested(record: Record<string, unknown>, path: string[]): unknown {
	let current: unknown = record;
	for (const key of path) {
		if (!isRecord(current) || !(key in current)) {
			return null;
		}
		current = current[key];
	}
	return current;
}

function firstArray(...candidates: unknown[]): unknown[] | null {
	for (const candidate of candidates) {
		if (Array.isArray(candidate)) {
			return candidate;
		}
	}
	return null;
}

function extractContentSources(props: AuthorBoxProps): unknown[] {
	return [props.content, props.entry, props.page, props.pageCtx, props.value].filter(Boolean);
}

function extractPrimaryBylineId(props: AuthorBoxProps): string | null {
	for (const source of extractContentSources(props)) {
		if (!isRecord(source)) {
			continue;
		}

		const direct = cleanString(source.primaryBylineId);
		if (direct) {
			return direct;
		}

		const nested = cleanString(readNested(source, ["data", "primaryBylineId"]));
		if (nested) {
			return nested;
		}
	}

	return null;
}

export function extractContributorCandidates(props: AuthorBoxProps): unknown[] | null {
	if (Array.isArray(props.contributors)) {
		return props.contributors;
	}

	for (const source of extractContentSources(props)) {
		if (!isRecord(source)) {
			continue;
		}

		const found = firstArray(
			source.bylines,
			source.contributors,
			readNested(source, ["data", "bylines"]),
			readNested(source, ["data", "contributors"]),
		);

		if (found) {
			return found;
		}
	}

	if (isRecord(props.node)) {
		return firstArray((props.node as Record<string, unknown>).contributors);
	}

	return null;
}

function sanitizeAvatarUrl(value: unknown): string | null {
	const candidate = cleanString(value);
	if (!candidate) {
		return null;
	}

	if (candidate.startsWith("/")) {
		return candidate;
	}

	return sanitizeHttpUrl(candidate);
}

function websiteLabelFromUrl(url: string | null): string | null {
	if (!url) {
		return null;
	}

	try {
		const hostname = new URL(url).hostname.replace(/^www\./, "");
		return hostname || null;
	} catch {
		return null;
	}
}

export function getContributorInitials(name: string): string | null {
	const words = name
		.trim()
		.split(/\s+/)
		.map((word) => word[0]?.toUpperCase())
		.filter(Boolean);

	if (words.length === 0) {
		return null;
	}

	if (words.length === 1) {
		return words[0] ?? null;
	}

	return `${words[0]}${words.at(-1)}`;
}

type ContributorCandidate = {
	id: string | null;
	name: string | null;
	bio: string | null;
	websiteUrl: string | null;
	avatarUrl: string | null;
	sortOrder: number | null;
	explicitPrimary: boolean;
};

function normalizeContributorCandidate(
	value: unknown,
	index: number,
	primaryBylineId: string | null,
): ContributorCandidate | null {
	if (!isRecord(value)) {
		return null;
	}

	const source = isRecord(value.byline) ? value.byline : value;
	const id =
		cleanString(source.id) ??
		cleanString(source.bylineId) ??
		cleanString(source.userId) ??
		cleanString(value.bylineId);
	const name = cleanString(source.displayName) ?? cleanString(source.name) ?? cleanString(source.title);
	if (!name) {
		return null;
	}

	const websiteUrl =
		sanitizeHttpUrl(source.websiteUrl) ??
		sanitizeHttpUrl(source.website) ??
		sanitizeHttpUrl(source.url);

	const avatarUrl =
		sanitizeAvatarUrl(source.avatarUrl) ??
		sanitizeAvatarUrl(readNested(source, ["avatar", "src"])) ??
		(cleanString(source.avatarMediaId)
			? `/_emdash/api/media/file/${encodeURIComponent(cleanString(source.avatarMediaId) as string)}`
			: null);

	const sortOrder =
		typeof value.sortOrder === "number"
			? value.sortOrder
			: typeof source.sortOrder === "number"
				? source.sortOrder
				: index;

	const explicitPrimary =
		value.isPrimary === true ||
		source.isPrimary === true ||
		(primaryBylineId !== null && id !== null && id === primaryBylineId) ||
		sortOrder === 0;

	return {
		id: id ?? null,
		name,
		bio: cleanString(source.bio),
		websiteUrl,
		avatarUrl,
		sortOrder,
		explicitPrimary,
	};
}

function mergeContributorCandidate(
	base: ContributorCandidate,
	incoming: ContributorCandidate,
): ContributorCandidate {
	return {
		...base,
		bio: base.bio ?? incoming.bio,
		websiteUrl: base.websiteUrl ?? incoming.websiteUrl,
		avatarUrl: base.avatarUrl ?? incoming.avatarUrl,
		explicitPrimary: base.explicitPrimary || incoming.explicitPrimary,
	};
}

export function normalizeContributors(
	input: unknown[] | null,
	options: {
		primaryBylineId?: string | null;
		contributorMode?: ContributorMode;
		contributorsScope?: ContributorsScope;
	},
): NormalizedContributor[] {
	if (!input || input.length === 0) {
		return [];
	}

	const rawCandidates = input
		.map((candidate, index) => normalizeContributorCandidate(candidate, index, options.primaryBylineId ?? null))
		.filter((candidate): candidate is ContributorCandidate => candidate !== null);

	if (rawCandidates.length === 0) {
		return [];
	}

	const deduped: ContributorCandidate[] = [];
	const seen = new Map<string, number>();

	for (const candidate of rawCandidates) {
		const key =
			candidate.id !== null
				? `id:${candidate.id}`
				: `name:${candidate.name?.toLowerCase() ?? ""}:${candidate.websiteUrl ?? ""}`;
		const existingIndex = seen.get(key);

		if (existingIndex !== undefined) {
			const existing = deduped[existingIndex];
			if (existing) {
				deduped[existingIndex] = mergeContributorCandidate(existing, candidate);
			}
			continue;
		}

		seen.set(key, deduped.length);
		deduped.push(candidate);
	}

	if (deduped.length === 0) {
		return [];
	}

	const primaryCandidate = deduped.find((candidate) => candidate.explicitPrimary) ?? deduped[0] ?? null;
	if (!primaryCandidate) {
		return [];
	}

	let ordered = deduped;
	if (options.contributorMode !== "byline-order") {
		ordered = [primaryCandidate, ...deduped.filter((candidate) => candidate !== primaryCandidate)];
	}

	if (options.contributorsScope === "primary-only") {
		ordered = [primaryCandidate];
	}

	return ordered.map((candidate) => ({
		id: candidate.id,
		name: candidate.name ?? "Unknown contributor",
		bio: candidate.bio,
		websiteUrl: candidate.websiteUrl,
		websiteLabel: websiteLabelFromUrl(candidate.websiteUrl),
		avatarUrl: candidate.avatarUrl,
		initials: getContributorInitials(candidate.name ?? ""),
		isPrimary: candidate === primaryCandidate,
	}));
}

function resolveLayout(
	settings: AuthorBoxSettings,
	blockLayout: unknown,
	explicitLayout: unknown,
): AuthorBoxLayout {
	const explicit = normalizeAuthorBoxLayoutPreference(explicitLayout);
	if (explicit && explicit !== "inherit") {
		return explicit;
	}

	const fromBlock = normalizeAuthorBoxLayoutPreference(blockLayout);
	if (fromBlock && fromBlock !== "inherit") {
		return fromBlock;
	}

	return settings.defaultLayout;
}

export function resolveAuthorBoxModel(props: AuthorBoxProps): ResolvedAuthorBoxModel | null {
	const node = normalizeAuthorBoxBlock(props.node);
	const settings = resolveAuthorBoxSettings(props.authorBoxSettings);
	const contributorsScope =
		normalizeContributorsScope(props.contributorsScope) ??
		normalizeContributorsScope(node.contributorsScope) ??
		"all";

	const contributors = normalizeContributors(extractContributorCandidates(props), {
		primaryBylineId: extractPrimaryBylineId(props),
		contributorMode: settings.contributorMode,
		contributorsScope,
	});

	if (contributors.length === 0) {
		return null;
	}

	const showBio = resolveVisibility(
		settings.showBio,
		normalizeVisibilityOverride(props.bioVisibility) ??
			normalizeVisibilityOverride(node.bioVisibility) ??
			null,
	);
	const showWebsite = resolveVisibility(
		settings.showWebsite,
		normalizeVisibilityOverride(props.websiteVisibility) ??
			normalizeVisibilityOverride(node.websiteVisibility) ??
			null,
	);

	return {
		id: cleanString(props.id),
		heading: cleanString(props.heading) ?? cleanString(node.heading) ?? null,
		headingLevel: resolveHeadingLevel(props.headingLevel),
		layout: contributors.length === 1 ? "single" : resolveLayout(settings, node.layout, props.layout),
		showAvatar: settings.showAvatar,
		showBio,
		showWebsite,
		showPrimaryBadge: contributors.length > 1 && resolveBooleanSetting(props.showPrimaryBadge, true),
		contributors,
		className: cleanString(props.class),
	};
}
