---
id: exp-20261101-7923
title: "Generate real route HTML for GitHub Pages indexing"
description: "Valid SPA routes served HTTP 404; build now emits route directories, content and matching canonicals."
type: bugfix
status: verified
confidence: high
created: 2026-11-01
updated: 2026-11-01
last_verified: 2026-11-01
area:
  - seo
  - deployment
tags:
  - github-pages
  - prerender
files:
  - scripts/prerender.ts
  - scripts/static-pages.tsx
  - client/src/hooks/useContentSEO.ts
root_cause: "GitHub Pages had only index.html and a copied 404.html for all SPA routes."
resolution: "Emit per-route index.html with actual content and metadata, and derive sitemap from the same routes."
verification:
  method: automated-tests
  result: passed
---
# Details

## Problem
Search Console showed 1 indexed and 10 excluded URLs. Public `/about` returned HTTP 404. That proves a crawlability defect, but does not identify every Search Console exclusion reason.

## Context
Vite/React SPA deployed to GitHub Pages through Bun. The original build copied the homepage HTML to 404.html, while listing internal routes in sitemap.xml. HTML initially had an empty root and a homepage canonical.

## Solution
Build static HTML for published routes, including full local article Markdown and existing About components. Keep client rendering and both themes. Generate sitemap from the exact route list. Use trailing-slash canonicals matching GitHub Pages directory URLs. Mark the real error document noindex; update detail metadata during client navigation.

## Verification
Production build passed. Three generator tests (60 assertions) and 15 existing Vitest tests passed. A local static HTTP preview returned 200 with content for all nine sitemap URLs. Browser navigation from About to Work to OrbitalNC preserved content and correct detail metadata.

## Reusable Knowledge
A functional JavaScript fallback does not turn GitHub Pages HTTP 404 into HTTP 200. Generate physical route files. Changing canonical only after JavaScript runs conflicts with a shared homepage canonical in the initial HTML.

## Limitations and Risks
Verified locally, not deployed as part of this record. Google indexing/ranking is not guaranteed. Remote-only blog files require a rebuild from the repository to acquire static pages. The baseline TypeScript check fails in untouched HeroGlobe3D.tsx due to nullable element narrowing. Local system Node cannot start because a Homebrew llhttp dylib is missing; Bun runs the build tools. Use Vite configLoader runner in a copied workspace with read-only symlinked node_modules to avoid writing .vite-temp outside that workspace.
