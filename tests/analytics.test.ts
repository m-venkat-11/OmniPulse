import { describe, it, expect } from "vitest";
import {
  calculateCTR,
  calculateCVR,
  calculateCostPerConversion,
  calculateWilsonScore95,
  evaluateTwoProportionGate,
} from "../src/server/services/experimentService";

describe("Analytics & Measurement Integrity (Acceptance Tests 18 & 19)", () => {
  it("Handles zero and missing denominators gracefully without throwing", () => {
    const zeroImp = calculateCTR(10, 0);
    expect(zeroImp.value).toBeNull();
    expect(zeroImp.warning).toContain("Zero or missing");

    const zeroClicks = calculateCVR(5, 0);
    expect(zeroClicks.value).toBeNull();
    expect(zeroClicks.warning).toContain("Zero or missing");

    const zeroConv = calculateCostPerConversion(1000, 0);
    expect(zeroConv.value).toBeNull();
    expect(zeroConv.warning).toContain("Zero conversions");
  });

  it("Detects clicks exceeding impressions (click-through impossibility)", () => {
    const invalid = calculateCTR(150, 100);
    expect(invalid.value).toBeNull();
    expect(invalid.warning).toContain("clicks cannot exceed impressions");
  });

  it("Calculates valid CTR and Wilson 95% confidence intervals", () => {
    const valid = calculateCTR(45, 1000);
    expect(valid.value).toBe(4.5); // 4.5%

    const wilson = calculateWilsonScore95(45, 1000);
    expect(wilson.lower).toBeGreaterThan(3.0);
    expect(wilson.upper).toBeLessThan(6.0);
    expect(wilson.lower).toBeLessThan(4.5);
    expect(wilson.upper).toBeGreaterThan(4.5);
  });

  it("Enforces 30-event sufficiency gate on two-proportion test", () => {
    // Insufficient sample: variant A has only 12 events
    const smallSample = evaluateTwoProportionGate(
      { events: 12, total: 200 },
      { events: 35, total: 300 }
    );
    expect(smallSample.isSufficient).toBe(false);
    expect(smallSample.message).toContain("Insufficient data, no conclusion");

    // Sufficient sample: both variants have >= 30 events and >= 30 non-events
    const adequateSample = evaluateTwoProportionGate(
      { events: 45, total: 1000 },
      { events: 80, total: 1000 }
    );
    expect(adequateSample.isSufficient).toBe(true);
    expect(adequateSample.pValue).toBeDefined();
    expect(adequateSample.pValue).toBeLessThan(0.05);
    expect(adequateSample.message).toContain("Statistically significant");
  });
});
