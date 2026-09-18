import { describe, expect, it } from "vitest";
import {
  demoApprovalItems,
  demoApprovalItemsWithDates,
  demoAuditEvents,
  demoAuditEventsWithDates,
  demoClients,
  demoPersona,
  demoSourceAsset,
} from "@/content/demo";
import { DEMO_LOGIN } from "@/design/types";

const HOUR_MS = 60 * 60 * 1000;

describe("demoPersona", () => {
  it("is the account the seed and the audit sign in with", () => {
    expect(demoPersona.email).toBe(DEMO_LOGIN.email);
    expect(demoPersona.name.length).toBeGreaterThan(1);
    expect(demoPersona.workspaceName.length).toBeGreaterThan(1);
  });
});

describe("demoClients", () => {
  it("fills a client selector", () => {
    expect(demoClients.length).toBeGreaterThanOrEqual(5);
    const names = demoClients.map((client) => client.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("demoApprovalItems", () => {
  it("has enough rows to fill a queue and a product frame", () => {
    expect(demoApprovalItems.length).toBeGreaterThanOrEqual(8);
    expect(demoApprovalItems.length).toBeLessThanOrEqual(15);
  });

  it("gives every row a unique review token, because the seed matches on it", () => {
    const tokens = demoApprovalItems.map((item) => item.reviewToken);
    expect(new Set(tokens).size).toBe(tokens.length);
  });

  it("only names a client the workspace runs", () => {
    const names = new Set(demoClients.map((client) => client.name));
    for (const item of demoApprovalItems) {
      expect(names.has(item.clientName), item.clientName).toBe(true);
    }
  });

  it("shows all four states a queue can be in", () => {
    const states = new Set(demoApprovalItems.map((item) => item.state));
    for (const state of ["DRAFT", "PENDING", "APPROVED", "REJECTED"]) {
      expect(states.has(state as (typeof demoApprovalItems)[number]["state"]), state).toBe(true);
    }
  });

  it("puts a reviewer name and a decision time on every decided row, and neither on an undecided one", () => {
    for (const item of demoApprovalItems) {
      const decided = item.state === "APPROVED" || item.state === "REJECTED" || item.state === "SCHEDULED";
      expect(Boolean(item.reviewerName), item.reviewToken).toBe(decided);
      expect(item.decidedHoursAgo !== null, item.reviewToken).toBe(decided);
    }
  });

  it("gives every rejection the note the client wrote", () => {
    for (const item of demoApprovalItems.filter((row) => row.state === "REJECTED")) {
      expect(item.decisionNote, item.reviewToken).toBeTruthy();
    }
  });

  it("keeps the repurposed drafts pointed at the source asset", () => {
    const cut = demoApprovalItems.filter((item) => item.sourceAssetTitle !== null);
    expect(cut.length).toBeGreaterThanOrEqual(3);
    for (const item of cut) {
      expect(item.sourceAssetTitle).toBe(demoSourceAsset.title);
    }
  });

  it("writes real posts, not placeholder text", () => {
    for (const item of demoApprovalItems) {
      expect(item.body.length, item.reviewToken).toBeGreaterThan(80);
      expect(item.body.toLowerCase(), item.reviewToken).not.toContain("lorem");
    }
  });

  it("uses plain hyphens everywhere", () => {
    const text =
      JSON.stringify(demoApprovalItems) +
      JSON.stringify(demoAuditEvents) +
      JSON.stringify(demoClients) +
      JSON.stringify(demoSourceAsset) +
      JSON.stringify(demoPersona);
    expect(text).not.toContain("—");
    expect(text).not.toContain("–");
  });
});

describe("demoAuditEvents", () => {
  it("only references rows that exist", () => {
    const tokens = new Set(demoApprovalItems.map((item) => item.reviewToken));
    for (const event of demoAuditEvents) {
      expect(tokens.has(event.reviewToken), event.reviewToken).toBe(true);
    }
  });

  it("records a decision for every decided row", () => {
    const decided = demoApprovalItems.filter((item) => item.decidedHoursAgo !== null);
    for (const item of decided) {
      const has = demoAuditEvents.some(
        (event) =>
          event.reviewToken === item.reviewToken &&
          (event.action === "APPROVED" || event.action === "REJECTED"),
      );
      expect(has, item.reviewToken).toBe(true);
    }
  });
});

describe("demoApprovalItemsWithDates", () => {
  const now = new Date("2026-09-16T12:00:00.000Z");

  it("dates every row relative to now", () => {
    const rows = demoApprovalItemsWithDates(now);
    expect(rows).toHaveLength(demoApprovalItems.length);

    for (const row of rows) {
      expect(row.createdAt.getTime(), row.reviewToken).toBe(now.getTime() - row.hoursAgo * HOUR_MS);
      if (row.decidedAt) {
        expect(row.decidedAt.getTime(), row.reviewToken).toBeGreaterThanOrEqual(
          row.createdAt.getTime(),
        );
      }
      if (row.scheduledFor) {
        expect(row.scheduledFor.getTime(), row.reviewToken).toBeGreaterThan(now.getTime());
      }
    }
  });

  it("is deterministic for the same now", () => {
    expect(demoApprovalItemsWithDates(now)).toEqual(demoApprovalItemsWithDates(new Date(now)));
  });
});

describe("demoAuditEventsWithDates", () => {
  it("runs newest first", () => {
    const stamps = demoAuditEventsWithDates(new Date("2026-09-16T12:00:00.000Z")).map((event) =>
      event.createdAt.getTime(),
    );
    expect([...stamps].sort((a, b) => b - a)).toEqual(stamps);
  });
});
