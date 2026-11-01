import { describe, expect, it } from "vitest";
import { GlobeRenderBudget } from "./globe-render-budget";
describe("adaptive globe quality", () => {
	it("keeps full quality for fast rendering and isolated startup stalls", () => {
		const budget = new GlobeRenderBudget(1.5, 1000 / 30);
		budget.observe(800); budget.observe(100);
		for (let i = 0; i < 60; i++) expect(budget.observe(1)).toBe(false);
		expect(budget.pixelRatio).toBe(1.5);
		expect(budget.frameInterval).toBe(1000 / 30);
	});
	it("reduces resolution and frame rate after sustained expensive rendering", () => {
		const budget = new GlobeRenderBudget(1.5, 1000 / 30);
		for (let i = 0; i < 13; i++) budget.observe(40);
		expect(budget.pixelRatio).toBe(1.5);
		expect(budget.observe(40)).toBe(true);
		expect(budget.pixelRatio).toBe(1.25);
		expect(budget.frameInterval).toBe(50);
	});
	it("bounds the quality reduction while keeping 3D active", () => {
		const budget = new GlobeRenderBudget(1, 50);
		for (let i = 0; i < 200; i++) budget.observe(100);
		expect(budget.pixelRatio).toBe(0.75);
		expect(budget.frameInterval).toBe(50);
	});
	it("does not increase resolution on low-density displays when slowing down", () => {
		const budget = new GlobeRenderBudget(0.5, 1000 / 30);
		for (let i = 0; i < 14; i++) budget.observe(40);
		expect(budget.pixelRatio).toBe(0.5);
		expect(budget.frameInterval).toBe(50);
	});
});
