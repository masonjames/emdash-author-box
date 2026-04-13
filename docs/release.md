# Release checklist

## Distribution model

`emdash-author-box` is a **trusted native plugin** for EmDash.

- Supported: npm distribution + `astro.config.mjs` install via `plugins: []`
- Supported: direct Astro component imports from `emdash-author-box/astro`
- Not supported today: `sandboxed: []`, marketplace bundle upload, or `emdash plugin publish`

That limitation comes from current EmDash core rules: Portable Text block plugins require `componentsEntry` and native mode, while the current marketplace bundler rejects plugins with `portableTextBlocks`.

## Before publishing

1. Update `package.json` and `src/constants.ts` with the new version.
2. Run:

	```bash
	npm install
	npm run check
	```

3. Smoke-test the plugin in a local EmDash site:

	- add `authorBoxPlugin()` in `astro.config.mjs`
	- verify the settings page appears
	- insert an `authorBox` block into a post
	- render a post with one contributor and with multiple contributors
	- verify direct theme usage with `AuthorBox.astro`

4. Review README examples and changelog copy.

## Publish to npm

```bash
npm publish --access public
```

If you are publishing from local development, export `NPM_TOKEN` first or log in with `npm login`.

## After publishing

1. Create a GitHub release for the version tag.
2. Verify the package page on npm and the README rendering.
3. Test install from a clean EmDash project:

	```bash
	npm install emdash-author-box
	```

4. Confirm the `astro.config.mjs` snippet from the README still works.
5. Deprecate the scoped legacy package after the unscoped package is verified:

	```bash
	npm deprecate "@masonjames/emdash-author-box@*" "Renamed to emdash-author-box. Install emdash-author-box instead."
	```

