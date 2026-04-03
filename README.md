# `@masonjames/emdash-author-box`

A polished author box plugin for EmDash CMS that turns existing EmDash bylines into a reusable presentation layer.

It ships with:

- an `authorBox` Portable Text block for editors
- a reusable `AuthorBox.astro` component for theme developers
- sitewide settings for avatar, bio, website link, layout, and contributor order defaults
- graceful handling for missing bios, avatars, websites, and empty bylines

## Compatibility

| Mode | Supported |
| --- | --- |
| Trusted install via `plugins: []` | Yes |
| Portable Text block rendering | Yes |
| Direct theme component import | Yes |
| Sandboxed install via `sandboxed: []` | No |
| EmDash marketplace bundle / `emdash plugin publish` | No |

Why not marketplace publishing yet?

This plugin depends on `componentsEntry` and `admin.portableTextBlocks`, which currently require EmDash native/trusted mode. Current EmDash marketplace bundling rejects Portable Text block plugins, so the supported release path today is **npm publish + trusted install in `astro.config.mjs`**.

## Installation

```bash
npm install @masonjames/emdash-author-box
```

Then register it in your site:

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import emdash from "emdash/astro";
import { authorBoxPlugin } from "@masonjames/emdash-author-box";

export default defineConfig({
	integrations: [
		emdash({
			plugins: [authorBoxPlugin()],
		}),
	],
});
```

## What the plugin adds

### Admin settings

The plugin creates an **Author Box** settings page with defaults for:

- showing contributor avatars
- showing contributor bios
- showing contributor website links
- choosing compact vs expanded multi-contributor layout
- choosing primary-first vs byline-order sorting

### Editor block

Editors can insert an `authorBox` Portable Text block and optionally override:

- heading text
- layout
- bio visibility
- website visibility
- all contributors vs primary contributor only

### Direct theme component

Theme authors can import the same presentation layer directly:

```astro
---
import { AuthorBox } from "@masonjames/emdash-author-box/astro";
---

<AuthorBox
	id="post-contributors"
	heading="Meet the contributors"
	headingLevel="h2"
	showPrimaryBadge={true}
	content={post}
	contributors={post.bylines}
/>
```

Additional component-only props:

- `id` — optional DOM id for the rendered `<aside>`
- `headingLevel` — choose from `"p" | "h2" | "h3" | "h4"`
- `showPrimaryBadge` — show or hide the primary-contributor badge for multi-author output

`id` is intended for direct component usage. Do **not** pass a shared `id` through `<PortableText ...>` unless you want every rendered author box on that page to receive the same DOM id.

## Portable Text usage

For the `authorBox` block to resolve the current entry’s bylines, pass the current content context through your Portable Text renderer:

```astro
---
import { PortableText } from "emdash/ui";
---

<PortableText
	value={post.data.content}
	content={post}
	contributors={post.bylines}
/>
```

The plugin auto-registers its `authorBox` component through `componentsEntry`, so you do not need to wire the block manually.

## Data contract

The component is designed around EmDash’s hydrated byline shape:

```ts
type ContentBylineCredit = {
	byline: {
		id: string;
		displayName: string;
		bio: string | null;
		avatarMediaId: string | null;
		websiteUrl: string | null;
	};
	sortOrder: number;
	roleLabel: string | null;
};
```

If no usable contributors are available, the component renders nothing.

## Design behavior

- one contributor → single spotlight card
- multiple contributors + expanded layout → equal-weight contributor cards
- multiple contributors + compact layout → tighter contributor list with clamped bios
- the resolved primary contributor is badged in multi-author output
- no avatar media → initials fallback
- invalid website URLs → omitted safely
- duplicate contributor entries → deduplicated without losing primary state

## Development

```bash
npm install
npm run check
```

## Publishing

This package is meant to be published to npm:

```bash
npm publish --access public
```

Do **not** use `emdash plugin publish` for this package today. EmDash’s current marketplace bundler rejects native Portable Text block plugins.
