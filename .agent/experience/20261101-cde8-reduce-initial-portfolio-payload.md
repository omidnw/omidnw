---
id: exp-20261101-cde8
title: "Defer idle music and non-home portfolio code"
description: "Reduce entry JavaScript 69.7 percent and avoid loading music before playback."
type: performance
status: verified
confidence: high
created: 2026-11-01
updated: 2026-11-01
last_verified: 2026-11-01
area:
  - frontend
  - performance
tags:
  - vite
  - audio
  - threejs
files:
  - client/src/App.tsx
  - client/src/components/Layout.tsx
  - client/src/contexts/MusicPlayerContext.tsx
  - client/src/components/themes/professional/HeroGlobe3D.tsx
verification:
  method: automated-tests
  result: passed
---
# Details

## Problem
User PageSpeed baseline: mobile 30, desktop 41, mobile LCP 8.1 seconds, TBT 8680 ms, total transfer about 8 MB.

## Root Cause
The 6,786,816-byte music file was constructed with a source and unconditionally loaded. Layout and RescueModeOverlay statically imported the terminal; route components were eager. Decorative WebGL rendered every animation frame.

## Solution
Set audio preload none before assigning src and load only on playback or saved autoplay. Lazy-load non-home routes, Cyberpunk header and terminal. Keep terminal mounted after its first opening to preserve session history. Discover fonts directly in HTML and preload the responsive hero image on home only. Keep mobile 3D as explicitly requested, with asynchronous shader compilation, 20/30 fps caps and capped pixel ratio. Capture a typed non-null host before the async closure, resolving the existing TypeScript errors in that touched component.

## Verification
Entry module plus static modulepreloads: 2,086,493 to 632,686 raw bytes (69.7 percent reduction), 625,387 to 198,547 gzip bytes. Both exclude dynamic globe code; these are not total-transfer figures. Preview logs contain no music request without playback. New music regressions fail on the original implementation. Eighteen Vitest tests and three static-page tests pass; typecheck and build pass. Browser verified visible 3D canvas on desktop and 390px mobile, no horizontal overflow, route navigation, and terminal pwd history after close/reopen; no console errors observed.

## Limitations and Risks
PageSpeed API returns 429 quota exceeded, so the new score, LCP and TBT are unmeasured. Visual checks are not a GPU benchmark; frame rates are caps, not guarantees. Hosting cache lifetimes and existing SVG background animation are unchanged.
