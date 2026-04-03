---
title: "PRD: EmDash Author Box"
status: draft
priority: P2
inspired_by: "Simple Author Box"
plugin_id: "author-box"
package_name: "@emdash-cms/plugin-author-box"
execution_mode: "Trusted-first, sandbox-compatible target"
---

# PRD: EmDash Author Box

## Product summary

EmDash Author Box renders a polished author or byline panel on content pages using EmDash’s existing byline and user data. The product should not create a parallel author-management system. Instead, it should turn existing presentation data into a reusable frontend module.

The MVP focuses on presentation and configuration, not author data entry.

## Problem

Publishers want author context on content pages because it improves trust, brand, and reader connection. But the most important data already belongs in core:

- bylines,
- display names,
- bios,
- avatar media,
- website links,
- contributor ordering.

The missing product is a flexible author box that teams can place inside content or templates.

## Goals

1. Turn existing byline data into a reusable author-box presentation layer.
2. Support both single-author and multi-contributor layouts.
3. Keep the MVP route-free and storage-free.
4. Make the plugin useful for editorial sites without replacing core byline management.
5. Preserve explicit placement rather than implicit page mutation.

## Non-goals

- Building a new author profile system
- Social graph management
- Follower counts
- Automatic “more posts by this author” logic in v1
- Sitewide auto-insertion

## Primary users

### Editors
They want to show contributor context without hand-formatting bios into article bodies.

### Site owners
They want more polished article presentation and stronger attribution.

### Theme developers
They want a drop-in author panel component that uses core data.

## Key user stories

1. As an editor, I can insert an author box into a story.
2. As a theme developer, I can render an author box below article content.
3. As a reader, I can quickly see who wrote or contributed to a piece.
4. As an admin, I can choose whether bio, avatar, and website are shown by default.
5. As an editor, I can choose between single-author emphasis and multi-contributor list layouts.

## MVP scope

### In scope

- `authorBox` Portable Text block
- theme-imported author-box component
- primary-byline and multi-contributor display modes
- sitewide settings for:
  - show avatar,
  - show bio,
  - show website link,
  - compact vs expanded default layout,
  - contributor display order mode

### Out of scope

- author management CRUD
- author archives
- related-posts modules
- social links editor inside the plugin
- automatic insertion into every content page

## Functional requirements

### Rendering

- The box must use existing byline data if available.
- If multiple contributors exist, the component must support:
  - primary author highlighted,
  - compact contributor list,
  - equal-weight contributor cards.
- Missing fields such as bio or website must not break layout.

### Admin configuration

- showAvatar default
- showBio default
- showWebsite default
- defaultLayout
- contributorMode

### Editor overrides

Per-block configuration must support:

- layout override
- show/hide bio
- show/hide website
- show all contributors vs primary only
- optional heading text

## UX and integration model

This should be a presentation plugin that assumes author data is already maintained in EmDash core.

Best paths:

- editor inserts `authorBox` block into content,
- theme imports an `AuthorBox.astro` component and renders it below the article.

## Technical approach for EmDash

### Plugin surfaces

- `admin.settingsSchema`
- `admin.portableTextBlocks`
- `componentsEntry`

### Capabilities

None required for MVP.

### Storage

No storage in v1.

### Routes

No plugin routes in v1.

### Data model

KV settings only:

- `settings:showAvatar`
- `settings:showBio`
- `settings:showWebsite`
- `settings:defaultLayout`
- `settings:contributorMode`

### Integration dependency

The plugin depends on core byline data being present on content items or otherwise available at render time. The PRD assumes that is the canonical source.

## Success metrics

- Teams can render author context without building custom presentation code.
- The plugin works for both single-author and co-authored pieces.
- No duplicate author system is introduced.
- The MVP ships without routes or storage.

## Risks and mitigations

### Risk: some content lacks bylines
Mitigation: fail gracefully and optionally render nothing.

### Risk: teams expect automatic insertion
Mitigation: document explicit placement as the intended integration model.

### Risk: sites want rich contributor cards
Mitigation: allow layout variants and leave deeper profile features to later phases.

## Milestones

1. Define settings and block schema.
2. Implement single-author layout.
3. Implement multi-contributor layout modes.
4. QA missing-data cases and responsive behavior.
5. Publish docs for content and theme integration.

## Acceptance criteria

- Editors can add an `authorBox` block.
- Theme developers can import the same behavior as a component.
- Single-author and multi-contributor rendering both work.
- The plugin launches without routes, storage, or required capabilities.

## Open questions

1. Should guest bylines render differently from user-linked bylines?
2. Do we want optional post-count or archive-link behavior later?
3. Should author role labels be shown when multiple contributors are present?
