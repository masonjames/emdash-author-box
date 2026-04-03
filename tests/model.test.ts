import { resolveAuthorBoxModel } from "../src/model.js";

const baseContributors = [
	{
		sortOrder: 1,
		byline: {
			id: "byline-b",
			displayName: "Morgan Editor",
			bio: "Leads coverage across long-form features.",
			avatarMediaId: "media-morgan",
			websiteUrl: "https://example.com/morgan",
		},
	},
	{
		sortOrder: 0,
		byline: {
			id: "byline-a",
			displayName: "Alex Reporter",
			bio: "Writes investigations and sharp explainers.",
			avatarMediaId: null,
			websiteUrl: "https://example.com/alex",
		},
	},
];

describe("resolveAuthorBoxModel", () => {
	it("returns null when no contributors resolve", () => {
		expect(resolveAuthorBoxModel({})).toBeNull();
	});

	it("renders a single-card variant for one contributor", () => {
		const model = resolveAuthorBoxModel({
			contributors: [baseContributors[0]],
		});

		expect(model?.layout).toBe("single");
		expect(model?.showPrimaryBadge).toBe(false);
		expect(model?.contributors).toHaveLength(1);
		expect(model?.contributors[0]?.name).toBe("Morgan Editor");
	});

	it("promotes the primary byline first when contributorMode is primary-first", () => {
		const model = resolveAuthorBoxModel({
			contributors: baseContributors,
			content: { primaryBylineId: "byline-a" },
		});

		expect(model?.contributors[0]?.id).toBe("byline-a");
		expect(model?.contributors[0]?.isPrimary).toBe(true);
		expect(model?.showPrimaryBadge).toBe(true);
	});

	it("keeps byline order while preserving the actual primary contributor", () => {
		const model = resolveAuthorBoxModel({
			contributors: baseContributors,
			content: { primaryBylineId: "byline-a" },
			authorBoxSettings: { contributorMode: "byline-order" },
		});

		expect(model?.contributors[0]?.id).toBe("byline-b");
		expect(model?.contributors[0]?.isPrimary).toBe(false);
		expect(model?.contributors[1]?.id).toBe("byline-a");
		expect(model?.contributors[1]?.isPrimary).toBe(true);
	});

	it("primary-only resolves the actual primary contributor even in byline order", () => {
		const model = resolveAuthorBoxModel({
			contributors: baseContributors,
			content: { primaryBylineId: "byline-a" },
			contributorsScope: "primary-only",
			authorBoxSettings: { contributorMode: "byline-order" },
		});

		expect(model?.layout).toBe("single");
		expect(model?.showPrimaryBadge).toBe(false);
		expect(model?.contributors).toHaveLength(1);
		expect(model?.contributors[0]?.id).toBe("byline-a");
		expect(model?.contributors[0]?.isPrimary).toBe(true);
	});

	it("supports per-block visibility and scope overrides", () => {
		const model = resolveAuthorBoxModel({
			contributors: baseContributors,
			node: {
				_type: "authorBox",
				bioVisibility: "hide",
				websiteVisibility: "show",
				contributorsScope: "primary-only",
			},
			content: { primaryBylineId: "byline-a" },
		});

		expect(model?.showBio).toBe(false);
		expect(model?.showWebsite).toBe(true);
		expect(model?.contributors).toHaveLength(1);
		expect(model?.contributors[0]?.id).toBe("byline-a");
	});

	it("suppresses invalid website URLs and deduplicates contributors", () => {
		const model = resolveAuthorBoxModel({
			contributors: [
				{
					sortOrder: 0,
					byline: {
						id: "byline-a",
						displayName: "Alex Reporter",
						bio: "Writes investigations and sharp explainers.",
						avatarMediaId: null,
						websiteUrl: "javascript:alert(1)",
					},
				},
				{
					sortOrder: 2,
					byline: {
						id: "byline-a",
						displayName: "Alex Reporter",
						bio: "Writes investigations and sharp explainers.",
						avatarMediaId: null,
						websiteUrl: "javascript:alert(1)",
					},
				},
			],
		});

		expect(model?.contributors).toHaveLength(1);
		expect(model?.contributors[0]?.websiteUrl).toBeNull();
	});

	it("preserves primary status when a later duplicate marks the contributor as primary", () => {
		const model = resolveAuthorBoxModel({
			contributors: [
				{
					sortOrder: 1,
					byline: {
						id: "byline-a",
						displayName: "Alex Reporter",
						bio: "Writes investigations and sharp explainers.",
						avatarMediaId: null,
						websiteUrl: "https://example.com/alex",
					},
				},
				{
					sortOrder: 2,
					byline: {
						id: "byline-b",
						displayName: "Morgan Editor",
						bio: "Leads coverage across long-form features.",
						avatarMediaId: "media-morgan",
						websiteUrl: "https://example.com/morgan",
					},
				},
				{
					sortOrder: 0,
					byline: {
						id: "byline-b",
						displayName: "Morgan Editor",
						bio: "Leads coverage across long-form features.",
						avatarMediaId: "media-morgan",
						websiteUrl: "https://example.com/morgan",
					},
				},
			],
		});

		expect(model?.contributors).toHaveLength(2);
		expect(model?.contributors[0]?.id).toBe("byline-b");
		expect(model?.contributors[0]?.isPrimary).toBe(true);
	});

	it("lets explicit component props win over stored block overrides", () => {
		const model = resolveAuthorBoxModel({
			contributors: baseContributors,
			node: {
				_type: "authorBox",
				layout: "compact",
				heading: "Stored heading",
			},
			layout: "expanded",
			heading: "Explicit heading",
		});

		expect(model?.layout).toBe("expanded");
		expect(model?.heading).toBe("Explicit heading");
	});

	it("normalizes id and heading level props", () => {
		const model = resolveAuthorBoxModel({
			contributors: baseContributors,
			id: " post-contributors ",
			heading: "Meet the contributors",
			headingLevel: "h3",
		});

		expect(model?.id).toBe("post-contributors");
		expect(model?.headingLevel).toBe("h3");
	});

	it("falls back to safe defaults for invalid ids, heading levels, and badge settings", () => {
		const model = resolveAuthorBoxModel({
			contributors: baseContributors,
			id: "   ",
			headingLevel: "script" as never,
			showPrimaryBadge: false,
		});

		expect(model?.id).toBeNull();
		expect(model?.headingLevel).toBe("p");
		expect(model?.showPrimaryBadge).toBe(false);
	});
});
