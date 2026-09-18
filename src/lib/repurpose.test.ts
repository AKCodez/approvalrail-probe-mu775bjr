import { describe, expect, it } from "vitest";
import { PLATFORMS } from "@/lib/approvals";
import { demoSourceAsset } from "@/content/demo";
import { draftingSystemPrompt, PLATFORM_LIMITS, plainCut } from "@/lib/repurpose";

describe("plainCut", () => {
  it("produces an editable draft for every platform, inside its limit", () => {
    for (const platform of PLATFORMS) {
      const cut = plainCut(platform, demoSourceAsset.title, demoSourceAsset.body);
      expect(cut.length, platform).toBeGreaterThan(40);
      expect(cut.length, platform).toBeLessThanOrEqual(PLATFORM_LIMITS[platform]);
      expect(cut, platform).toContain(demoSourceAsset.title);
    }
  });

  it("numbers an X thread so the shape survives the paste", () => {
    const cut = plainCut("X", demoSourceAsset.title, demoSourceAsset.body);
    expect(cut).toContain("1/ ");
    expect(cut).toContain("2/ ");
  });

  it("never ends mid-word", () => {
    const cut = plainCut("THREADS", demoSourceAsset.title, demoSourceAsset.body);
    expect(cut).toBe(cut.trim());
  });
});

describe("draftingSystemPrompt", () => {
  it("carries the rules and never the user's text", () => {
    for (const platform of PLATFORMS) {
      const prompt = draftingSystemPrompt(platform);
      expect(prompt).toContain("Invent no statistics");
      expect(prompt).not.toContain(demoSourceAsset.body);
      expect(prompt).not.toContain("—");
    }
  });
});
