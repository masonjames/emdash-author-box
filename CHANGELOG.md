# Changelog

## Unreleased

## 0.1.3

- Added package-level plugin identity metadata and explicit no-permission descriptor metadata for marketplace trust review.

## 0.1.2

- Fixed the published package contents so direct Astro component imports include the supporting source modules.

## 0.1.1

- Renamed the npm package to `emdash-author-box` for unscoped installs
- Added component-level `id`, `headingLevel`, and `showPrimaryBadge` props for direct theme usage
- Fixed primary-contributor resolution so `byline-order` preserves display order without losing the true primary contributor
- Refined compact multi-author visuals with a primary badge, tighter spacing, and clamped bios
- Documented the new direct-component API and the `id` caveat for Portable Text usage

## 0.1.0

- Initial release of `@masonjames/emdash-author-box`
- Added a polished `authorBox` Portable Text block for EmDash editors
- Added a reusable `AuthorBox.astro` component for direct theme placement
- Added sitewide settings for avatars, bios, website links, layout, and contributor ordering
- Added render-normalization helpers and unit tests for missing-data, deduping, and override behavior
- Added trusted-install documentation and release guidance for npm distribution
