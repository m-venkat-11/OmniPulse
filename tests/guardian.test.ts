import { describe, it, expect } from "vitest";
import {
  guardianService,
  normalizeCleanText,
  countGraphemes,
} from "../src/server/services/guardianService";

describe("Brand Guardian Deterministic Layer 1 & Claims (Acceptance Tests 12 & 13)", () => {
  it("Catches prohibited phrases with zero-width characters and spaces", () => {
    // String with zero-width spaces (\u200B) injected between characters to bypass naive regex
    const adversarialText = "Our herbal formula 1\u200B0\u200B0\u200B% c\u200Bu\u200Br\u200Be\u200Bs morning acidity instantly.";
    const findings = guardianService.runDeterministicLayer1(adversarialText, {
      prohibitedPhrases: ["cures morning acidity"],
      mandatoryDisclosures: [],
      lockedTokens: [],
    });

    expect(findings.length).toBeGreaterThan(0);
    const criticalFinding = findings.find((f) => f.severity === "Critical");
    expect(criticalFinding).toBeDefined();
    expect(criticalFinding?.resultClass).toBe("Rule violation");
  });

  it("Detects modified or dropped locked tokens (e.g. changing 20% or dropping 'up to')", () => {
    // User modified "20% festive discount" to "30%" and omitted "up to"
    const textWithAlteredToken = "Enjoy 30% discount on festive family pack today!";
    const findings = guardianService.runDeterministicLayer1(textWithAlteredToken, {
      prohibitedPhrases: [],
      mandatoryDisclosures: [],
      lockedTokens: ["up to 20% discount", "FSSAI Lic #10020042000123"],
    });

    expect(findings.length).toBe(2);
    const tokenFinding = findings.find((f) => f.category === "Locked Token Integrity");
    expect(tokenFinding).toBeDefined();
    expect(tokenFinding?.severity).toBe("High");
    expect(tokenFinding?.quotedText).toBe("up to 20% discount");
  });

  it("Detects missing mandatory legal disclosures", () => {
    const textWithoutDisclosure = "Crispy delicious millet dosa mix. Order now for your family.";
    const findings = guardianService.runDeterministicLayer1(textWithoutDisclosure, {
      prohibitedPhrases: [],
      mandatoryDisclosures: ["FSSAI Lic #10020042000123. ASCI Code Compliant."],
      lockedTokens: [],
    });

    const discFinding = findings.find((f) => f.category === "Mandatory Disclosure Missing");
    expect(discFinding).toBeDefined();
    expect(discFinding?.severity).toBe("Critical");
    expect(discFinding?.resultClass).toBe("Rule violation");
  });

  it("Calculates grapheme clusters accurately for Indic script text", () => {
    // Telugu text grapheme cluster count
    const teluguText = "శ్రీ మిల్లెట్స్";
    const graphemes = countGraphemes(teluguText, "te");
    expect(graphemes).toBeGreaterThan(0);
    expect(graphemes).toBeLessThan(teluguText.length); // graphemes != UTF-16 code units in Indic scripts!
  });
});
