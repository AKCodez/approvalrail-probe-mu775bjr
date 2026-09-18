/**
 * The seeded demo content, written out by hand.
 *
 * Both the seed (`prisma/seed.ts`) and the landing page's `ProductFrame` read
 * this file, so the ledger on the marketing page and the queue a signed-in
 * account sees are the same rows.
 *
 * Two rules when this data changes:
 *
 *   1. Every derived field is precomputed. Generated drafts are written out
 *      here, never produced by a model, so seeding a fresh database never
 *      needs a key or a network.
 *   2. Times are relative (`hoursAgo`), never literal. A queue full of rows
 *      dated last March reads as an abandoned account.
 *
 * Nothing here is a testimonial, a customer count or a revenue figure.
 */
import { DEMO_LOGIN } from "@/design/types";

export type DemoPersona = {
  name: string;
  /**
   * The seeded account. Never render this in the UI: the demo banner is the
   * only place a preview may show the demo address.
   */
  email: string;
  workspaceName: string;
  role: string;
};

export const demoPersona: DemoPersona = {
  name: "Dana Reyes",
  email: DEMO_LOGIN.email,
  workspaceName: "Meridian Social",
  role: "Account manager",
};

/** Mirrors the `Platform` enum in prisma/schema.prisma. */
export type DemoPlatform = "X" | "INSTAGRAM" | "LINKEDIN" | "THREADS" | "FACEBOOK";

/** Mirrors the `ApprovalState` enum in prisma/schema.prisma. */
export type DemoApprovalState = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "SCHEDULED";

/** Mirrors the `AuditAction` enum in prisma/schema.prisma. */
export type DemoAuditAction =
  | "CREATED"
  | "SENT_FOR_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "RELEASED"
  | "EDITED";

export type DemoClient = {
  name: string;
  /** What this account posts about, in one line. Shown in the client selector. */
  focus: string;
  /** Who signs off for this client. */
  reviewer: string;
};

/** The client accounts the demo workspace runs. */
export const demoClients: readonly DemoClient[] = [
  { name: "Northgate Dental", focus: "Patient education and practice news", reviewer: "Dana Reyes" },
  { name: "Lumen Fitness", focus: "Class schedules and coaching notes", reviewer: "Priya Shah" },
  { name: "Harbour Legal", focus: "Lease law and commercial property", reviewer: "Tom Achebe" },
  { name: "Alder and Finch Bakery", focus: "Daily bakes and market days", reviewer: "Sofia Marchetti" },
  { name: "Coastline Veterinary", focus: "Seasonal pet care and clinic hours", reviewer: "Dana Reyes" },
  { name: "Rivet Coworking", focus: "Member events and desk availability", reviewer: "Ben Lindqvist" },
];

/** The long-form asset the repurposer demo is cut from. */
export const demoSourceAsset = {
  title: "Five fluoride myths patients still repeat",
  clientName: "Northgate Dental",
  body:
    "Patients arrive with the same five worries about fluoride, and most of them come from a forwarded post rather than a dentist. " +
    "The first is that fluoride is an additive with no history: it has been in municipal water since 1945 and the dose has barely moved. " +
    "The second is that a fluoride-free toothpaste protects children better, when the evidence points the other way for anyone old enough to spit. " +
    "The third is that fluorosis is common; it is almost always mild, cosmetic and caused by swallowing toothpaste, which is why a pea-sized amount is the rule. " +
    "The fourth is that a good diet replaces it, which confuses two different jobs: diet reduces acid attacks, fluoride rebuilds the enamel that survives them. " +
    "The fifth is that a practice recommends it for the money, when a filling costs the patient more than a tube of toothpaste ever will. " +
    "The useful answer in the chair is not a study; it is a sentence the patient can repeat to the person who sent them the post.",
} as const;

/** One row of `ApprovalItem`, plus the offsets the seed turns into timestamps. */
export type DemoApprovalItem = {
  /** Also the seed's match key, so re-seeding refreshes rather than duplicates. */
  reviewToken: string;
  clientName: string;
  platform: DemoPlatform;
  body: string;
  /** The long-form asset this draft was cut from, when it came from one. */
  sourceAssetTitle: string | null;
  state: DemoApprovalState;
  /** Set only once a decision is on the record. */
  reviewerName: string | null;
  decisionNote: string | null;
  /** Whole hours before "now" the row was created. */
  hoursAgo: number;
  /** Hours before "now" the decision landed. Null while it is undecided. */
  decidedHoursAgo: number | null;
  /** Hours after "now" the booked slot sits. Null when nothing is booked. */
  scheduledInHours: number | null;
};

export const demoApprovalItems: readonly DemoApprovalItem[] = [
  {
    reviewToken: "rv-northgate-fluoride-thread",
    clientName: "Northgate Dental",
    platform: "X",
    body:
      "Five fluoride myths we hear in the chair every week, and the one sentence we answer each with.\n\n1. It is a new additive. It has been in water since 1945.\n2. Fluoride-free is safer for kids. Not once they can spit.\n3. Fluorosis is common. It is rare, mild and cosmetic.\n4. A good diet replaces it. Different jobs: diet cuts acid, fluoride rebuilds enamel.\n5. You only recommend it for the money. A filling costs more than a tube.",
    sourceAssetTitle: "Five fluoride myths patients still repeat",
    state: "PENDING",
    reviewerName: null,
    decisionNote: null,
    hoursAgo: 6,
    decidedHoursAgo: null,
    scheduledInHours: 28,
  },
  {
    reviewToken: "rv-northgate-hygienist",
    clientName: "Northgate Dental",
    platform: "INSTAGRAM",
    body:
      "Meet Rosa, who joined us this month as our third hygienist. She has spent nine years in community clinics and she is unhurried in a way patients notice in the first ten seconds. Evening appointments open from the 14th. Link in bio to book.",
    sourceAssetTitle: null,
    state: "APPROVED",
    reviewerName: "Dana Reyes",
    decisionNote: null,
    hoursAgo: 26,
    decidedHoursAgo: 21,
    scheduledInHours: 6,
  },
  {
    reviewToken: "rv-lumen-winter-programming",
    clientName: "Lumen Fitness",
    platform: "LINKEDIN",
    body:
      "Winter programming is the part of the year most gyms get wrong. We rebuild the block around three things: shorter sessions, heavier lifts and a schedule that survives a dark Tuesday. Here is what changed for our members last year, and what we kept.",
    sourceAssetTitle: null,
    state: "REJECTED",
    reviewerName: "Priya Shah",
    decisionNote: "Shorten the intro. Open on what changed for members, not on other gyms.",
    hoursAgo: 30,
    decidedHoursAgo: 24,
    scheduledInHours: null,
  },
  {
    reviewToken: "rv-lumen-class-schedule",
    clientName: "Lumen Fitness",
    platform: "THREADS",
    body:
      "New class schedule from Monday. Two extra strength slots at 06:30, the Saturday conditioning class moves to 09:00, and mobility stays where it is because you all asked. Full timetable on the site.",
    sourceAssetTitle: null,
    state: "APPROVED",
    reviewerName: "Priya Shah",
    decisionNote: null,
    hoursAgo: 20,
    decidedHoursAgo: 14,
    scheduledInHours: 19,
  },
  {
    reviewToken: "rv-harbour-lease-law",
    clientName: "Harbour Legal",
    platform: "X",
    body:
      "The lease law update that lands in April changes who pays for a survey when a break clause is exercised. If you hold commercial premises on a five-year term, this is the paragraph to read twice.",
    sourceAssetTitle: null,
    state: "DRAFT",
    reviewerName: null,
    decisionNote: null,
    hoursAgo: 3,
    decidedHoursAgo: null,
    scheduledInHours: null,
  },
  {
    reviewToken: "rv-harbour-carousel",
    clientName: "Harbour Legal",
    platform: "INSTAGRAM",
    body:
      "Six slides on what a commercial lease actually commits you to, written for a first-time tenant. Slide one: the term is not the exit. Slide two: repair obligations outlive the fit-out. Swipe for the rest.",
    sourceAssetTitle: null,
    state: "PENDING",
    reviewerName: null,
    decisionNote: null,
    hoursAgo: 19,
    decidedHoursAgo: null,
    scheduledInHours: 45,
  },
  {
    reviewToken: "rv-northgate-fluoride-instagram",
    clientName: "Northgate Dental",
    platform: "INSTAGRAM",
    body:
      "Fluorosis is the worry we hear most, and it is almost always mild, cosmetic, and caused by swallowing toothpaste rather than by water. A pea-sized amount, spat not rinsed, is the whole rule. Save this for the next family argument.",
    sourceAssetTitle: "Five fluoride myths patients still repeat",
    state: "DRAFT",
    reviewerName: null,
    decisionNote: null,
    hoursAgo: 5,
    decidedHoursAgo: null,
    scheduledInHours: null,
  },
  {
    reviewToken: "rv-northgate-fluoride-linkedin",
    clientName: "Northgate Dental",
    platform: "LINKEDIN",
    body:
      "Patient education fails when it answers with a study. We rewrote our fluoride guidance as five sentences a patient can repeat to whoever sent them the post, and the conversations in the chair got shorter and calmer. Here is the wording we settled on.",
    sourceAssetTitle: "Five fluoride myths patients still repeat",
    state: "DRAFT",
    reviewerName: null,
    decisionNote: null,
    hoursAgo: 5,
    decidedHoursAgo: null,
    scheduledInHours: null,
  },
  {
    reviewToken: "rv-alder-market-day",
    clientName: "Alder and Finch Bakery",
    platform: "INSTAGRAM",
    body:
      "Market day tomorrow, and the rye is back. We are on the north side by the flower stall from seven, and the sourdough usually goes by nine, which is not a boast so much as a warning.",
    sourceAssetTitle: null,
    state: "SCHEDULED",
    reviewerName: "Sofia Marchetti",
    decisionNote: null,
    hoursAgo: 52,
    decidedHoursAgo: 46,
    scheduledInHours: 12,
  },
  {
    reviewToken: "rv-alder-opening-hours",
    clientName: "Alder and Finch Bakery",
    platform: "THREADS",
    body:
      "We are closing at two on Sunday for the staff party. Everything left goes half price from one, which is the closest thing to a tradition we have.",
    sourceAssetTitle: null,
    state: "REJECTED",
    reviewerName: "Sofia Marchetti",
    decisionNote: "Say the party is for the team, and drop the half price line until we confirm stock.",
    hoursAgo: 44,
    decidedHoursAgo: 38,
    scheduledInHours: null,
  },
  {
    reviewToken: "rv-coastline-winter-paws",
    clientName: "Coastline Veterinary",
    platform: "LINKEDIN",
    body:
      "Grit burns paws, and we see the same three cases every January. Wash and dry after a walk, check between the pads, and call us before it becomes a limp. Clinic hours over the winter are on the site.",
    sourceAssetTitle: null,
    state: "APPROVED",
    reviewerName: "Dana Reyes",
    decisionNote: null,
    hoursAgo: 40,
    decidedHoursAgo: 33,
    scheduledInHours: 30,
  },
  {
    reviewToken: "rv-rivet-member-evening",
    clientName: "Rivet Coworking",
    platform: "X",
    body:
      "Member evening on the 26th: three short talks, one of them about the accounting software nobody enjoys, and the bar tab lasts until it does not. Bring someone who is thinking about a desk.",
    sourceAssetTitle: null,
    state: "PENDING",
    reviewerName: null,
    decisionNote: null,
    hoursAgo: 11,
    decidedHoursAgo: null,
    scheduledInHours: 36,
  },
  {
    reviewToken: "rv-rivet-desk-availability",
    clientName: "Rivet Coworking",
    platform: "THREADS",
    body:
      "Four fixed desks opened up on the second floor, which is the quiet one. Same rate as last year, month to month, no deposit. Reply here or email the team.",
    sourceAssetTitle: null,
    state: "SCHEDULED",
    reviewerName: "Ben Lindqvist",
    decisionNote: null,
    hoursAgo: 62,
    decidedHoursAgo: 55,
    scheduledInHours: 4,
  },
];

/** One row of `AuditEvent`, tied to an item by its review token. */
export type DemoAuditEvent = {
  reviewToken: string;
  action: DemoAuditAction;
  actor: string;
  note: string | null;
  hoursAgo: number;
};

export const demoAuditEvents: readonly DemoAuditEvent[] = [
  { reviewToken: "rv-northgate-fluoride-thread", action: "CREATED", actor: "Dana Reyes", note: "Cut from Five fluoride myths patients still repeat", hoursAgo: 6 },
  { reviewToken: "rv-northgate-fluoride-thread", action: "SENT_FOR_REVIEW", actor: "Dana Reyes", note: null, hoursAgo: 6 },
  { reviewToken: "rv-northgate-hygienist", action: "SENT_FOR_REVIEW", actor: "Dana Reyes", note: null, hoursAgo: 25 },
  { reviewToken: "rv-northgate-hygienist", action: "APPROVED", actor: "Dana Reyes", note: null, hoursAgo: 21 },
  { reviewToken: "rv-lumen-winter-programming", action: "SENT_FOR_REVIEW", actor: "Dana Reyes", note: null, hoursAgo: 29 },
  { reviewToken: "rv-lumen-winter-programming", action: "REJECTED", actor: "Priya Shah", note: "Shorten the intro. Open on what changed for members, not on other gyms.", hoursAgo: 24 },
  { reviewToken: "rv-lumen-class-schedule", action: "APPROVED", actor: "Priya Shah", note: null, hoursAgo: 14 },
  { reviewToken: "rv-harbour-carousel", action: "SENT_FOR_REVIEW", actor: "Dana Reyes", note: null, hoursAgo: 19 },
  { reviewToken: "rv-alder-market-day", action: "APPROVED", actor: "Sofia Marchetti", note: null, hoursAgo: 46 },
  { reviewToken: "rv-alder-market-day", action: "RELEASED", actor: "Dana Reyes", note: null, hoursAgo: 45 },
  { reviewToken: "rv-alder-opening-hours", action: "REJECTED", actor: "Sofia Marchetti", note: "Say the party is for the team, and drop the half price line until we confirm stock.", hoursAgo: 38 },
  { reviewToken: "rv-coastline-winter-paws", action: "APPROVED", actor: "Dana Reyes", note: null, hoursAgo: 33 },
  { reviewToken: "rv-rivet-member-evening", action: "SENT_FOR_REVIEW", actor: "Dana Reyes", note: null, hoursAgo: 11 },
  { reviewToken: "rv-rivet-desk-availability", action: "APPROVED", actor: "Ben Lindqvist", note: null, hoursAgo: 55 },
  { reviewToken: "rv-rivet-desk-availability", action: "RELEASED", actor: "Dana Reyes", note: null, hoursAgo: 54 },
];

const HOUR_MS = 60 * 60 * 1000;

export type DemoApprovalItemWithDates = DemoApprovalItem & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  decidedAt: Date | null;
  scheduledFor: Date | null;
  releasedAt: Date | null;
};

/**
 * The same rows with real timestamps, counted back from `now`.
 *
 * Deterministic and timezone-free: the same `now` always gives the same dates,
 * so the seed, the tests and the marketing frame agree.
 */
export function demoApprovalItemsWithDates(now: Date = new Date()): DemoApprovalItemWithDates[] {
  return demoApprovalItems.map((item) => {
    const createdAt = new Date(now.getTime() - item.hoursAgo * HOUR_MS);
    const decidedAt =
      item.decidedHoursAgo === null ? null : new Date(now.getTime() - item.decidedHoursAgo * HOUR_MS);
    const scheduledFor =
      item.scheduledInHours === null ? null : new Date(now.getTime() + item.scheduledInHours * HOUR_MS);
    const releasedAt =
      item.state === "SCHEDULED" && decidedAt ? new Date(decidedAt.getTime() + HOUR_MS) : null;
    return {
      ...item,
      id: item.reviewToken,
      createdAt,
      updatedAt: decidedAt ?? createdAt,
      decidedAt,
      scheduledFor,
      releasedAt,
    };
  });
}

export type DemoAuditEventWithDate = DemoAuditEvent & { id: string; createdAt: Date };

/** The ledger rows, newest first, with real timestamps. */
export function demoAuditEventsWithDates(now: Date = new Date()): DemoAuditEventWithDate[] {
  return demoAuditEvents
    .map((event, index) => ({
      ...event,
      id: `${event.reviewToken}-${index}`,
      createdAt: new Date(now.getTime() - event.hoursAgo * HOUR_MS - (index % 7) * 60 * 1000),
    }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
