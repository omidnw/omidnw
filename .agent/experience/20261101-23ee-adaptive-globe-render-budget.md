---
id: exp-20261101-23ee
title: "Adapt globe quality to sustained render submission cost"
description: "Preserve full quality on fast devices and reduce resolution only after repeated slow submissions."
type: performance
status: verified
confidence: high
created: 2026-11-01
updated: 2026-11-01
last_verified: 2026-11-01
area:
  - performance
  - webgl
tags:
  - threejs
  - adaptive-quality
files:
  - client/src/lib/globe-render-budget.ts
  - client/src/components/themes/professional/HeroGlobe3D.tsx
verification:
  method: automated-tests
  result: passed
---
# Details

## Problem
Latest user reports: mobile 78, FCP 1.1s, LCP 4.1s, TBT 360ms; desktop 70, LCP 0.7s, TBT 1380ms. Need reduce expensive decorative processing without removing mobile 3D.

## Investigation
Temporary local-only instrumentation recorded 70 render submissions averaging 0.71ms (max 27ms). Asset load 24.8ms, context creation 24.2ms, scene construction 7.4ms, shader compilation 24.9ms. This browser did not reproduce the expensive desktop Lighthouse trace. These are CPU-side wall durations, not asynchronous GPU timings. No profiling DOM attributes are shipped.

## Solution
Observe synchronous render submission duration at runtime. Skip the first two warmup submissions; after twelve samples averaging above 16ms, lower pixel ratio by 0.25, bounded at 0.75 without ever increasing a lower native ratio, and cap animation at 20fps. Preserve fast-device quality. Resize resets the budget for the new viewport. The 3D scene and interactions remain.

## Verification
Four quality-budget cases cover fast frames/startup stalls, sustained slow samples, bounds and low-density displays. Total 29 tests, typecheck and build passed. Local browser retained the original 789x526 desktop canvas with no overflow or console error. Pixel resolution reduction on a simulated slow device is proven by policy tests; real slow GPU performance is not measured.

## Limitations and Risks
No fresh PageSpeed score or TBT reduction has been measured. If expensive work occurs outside renderer submission, this monitor may not detect it. Quality degrades until a resize resets the budget; it does not oscillate back and forth. Initial context/shader stalls remain a separate concern.
