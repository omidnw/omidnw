---
id: exp-20261101-bae5
title: "Render visible home content and serve fonts locally"
description: "Address delayed mobile logo LCP and repainting SVG signals using first-response content and local fonts."
type: performance
status: verified
confidence: high
created: 2026-11-01
updated: 2026-11-01
last_verified: 2026-11-01
area:
  - performance
  - fonts
  - prerender
tags:
  - lcp
  - ssr
  - fonts
  - svg
files:
  - scripts/static-pages.tsx
  - client/src/components/Layout.tsx
  - client/src/styles/fonts.css
  - client/src/styles/circuit.css
verification:
  method: automated-tests
  result: passed
---
# Details

## Problem
After the first optimization, user reports mobile 68 (LCP 5.6s, TBT 80ms) and desktop 69 (LCP 1.1s, TBT 1010ms). Detailed mobile LCP candidate is the ORK header logo with 2010ms element render delay. Both reports flag 12 stroke-dashoffset animations and a render-blocking Google Fonts stylesheet.

## Root Cause
The old static home output was a summary rather than the actual header/hero. Professional PageTransition initialized opacity 0, which also hides server-rendered content. Fonts required a separate stylesheet and font hosts. SVG signal animation changed dash geometry continuously. Reports alone do not prove the exact cause of desktop GPU/main-thread blocking.

## Solution
Render the actual default home App with the existing Wouter SSR path at build time. Theme and rescue state default safely without browser storage. Professional entrance opacity is immediately 1; retain Cyberpunk animation. Preload the logo responsively and mark it high priority. Serve unmodified Google Fonts WOFF2 files locally, preserving four used font families and all supplied language subsets; include source checksums and four OFL licenses. Preload the two default Latin faces. Replace moving dash geometry with opacity-only highlight pulses. Keep mobile 3D and the existing globe renderer.

## Verification
Five static-page tests (118 assertions), 18 existing/runtime tests, typecheck and production build pass. The new home-content regression fails against the previous builder. Browser desktop and 390px mobile show loaded local fonts, visible 3D canvas, visible main content and no horizontal overflow or console errors. Static home HTML is about 60KB raw / 10.8KB gzip and contains actual header/hero before client execution. Only the first-party CSS stylesheet remains for fonts, with two local font preloads. SVG keyframes no longer animate stroke-dashoffset.

## Limitations and Risks
Fresh PageSpeed results are not yet measured. The previous API attempt returned quota error 429. Header cache TTL is controlled by GitHub Pages and remains unchanged. Rendering full initial content adds a few compressed KB to the HTML; it removes dependence on client startup for displaying that content. CSS opacity is compositor-friendly, but actual Lighthouse animation/compositing results still need a fresh audit.
