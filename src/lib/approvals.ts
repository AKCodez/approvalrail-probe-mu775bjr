/**
 * How an approval row reads on screen.
 *
 * The state machine lives here, in one place, so the queue, the review page and
 * the dashboard all name a state the same way and disable the same actions for
 * the same reason. Nothing in this file touches the database or the session.
 */
import type { BadgeTone } from "@/components/ui/badge";
import type { DemoApprovalState, DemoPlatform } from "@/content/demo";

export type Platform = DemoPlatform;
export type ApprovalState = DemoApprovalState;

export const PLATFORMS: readonly Platform[] = ["X", "INSTAGRAM", "LINKEDIN", "THREADS", "FACEBOOK"];

const PLATFORM_LABELS: Record<Platform, string> = {
  X: "X",
  INSTAGRAM: "Instagram",
  LINKEDIN: "LinkedIn",
  THREADS: "Threads",
  FACEBOOK: "Facebook",
};

/** What the platform calls a post, for the review page's platform shape. */
const PLATFORM_SHAPES: Record<Platform, string> = {
  X: "Thread, 280 characters a post",
  INSTAGRAM: "Caption, up to 2,200 characters",
  LINKEDIN: "Post, first two lines visible",
  THREADS: "Post, 500 characters",
  FACEBOOK: "Post, first three lines visible",
};

export function platformLabel(platform: Platform): string {
  return PLATFORM_LABELS[platform];
}

export function platformShape(platform: Platform): string {
  return PLATFORM_SHAPES[platform];
}

const STATE_LABELS: Record<ApprovalState, string> = {
  DRAFT: "Draft",
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  SCHEDULED: "Released",
};

/* Accent is reserved for pending and approved, per the brand's imagery rules. */
const STATE_TONES: Record<ApprovalState, BadgeTone> = {
  DRAFT: "neutral",
  PENDING: "accent",
  APPROVED: "accent",
  REJECTED: "critical",
  SCHEDULED: "positive",
};

export function stateLabel(state: ApprovalState): string {
  return STATE_LABELS[state];
}

export function stateTone(state: ApprovalState): BadgeTone {
  return STATE_TONES[state];
}

/**
 * Why Release to schedule is not available, or null when it is.
 *
 * The queue never hides the action: it shows it disabled with this sentence
 * beside it, so an account manager can see what is holding the row.
 */
export function releaseBlockedReason(state: ApprovalState): string | null {
  switch (state) {
    case "APPROVED":
      return null;
    case "DRAFT":
      return "Blocked: this draft has not been sent for review.";
    case "PENDING":
      return "Blocked: waiting on the client's approval.";
    case "REJECTED":
      return "Blocked: rejected. Edit it and send it again.";
    case "SCHEDULED":
      return "Released to the schedule already.";
  }
}

/** True when Send for review is the next move. */
export function canSendForReview(state: ApprovalState): boolean {
  return state === "DRAFT" || state === "REJECTED";
}

/** The path a client opens. No session, no account, one row. */
export function reviewPath(token: string): string {
  return `/review/${token}`;
}

/** An absolute review link, for the copy button and for email. */
export function reviewUrl(origin: string, token: string): string {
  return `${origin.replace(/\/+$/, "")}${reviewPath(token)}`;
}

/** Hours between sending for review and the decision, rounded to one decimal. */
export function turnaroundHours(createdAt: Date, decidedAt: Date): number {
  return Math.max(0, (decidedAt.getTime() - createdAt.getTime()) / (60 * 60 * 1000));
}

/** The median of a list of numbers, or null when the list is empty. */
export function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle] ?? null;
  const low = sorted[middle - 1];
  const high = sorted[middle];
  if (low === undefined || high === undefined) return null;
  return (low + high) / 2;
}

/** A token a review link can carry: URL-safe, unguessable enough for a demo. */
export function newReviewToken(): string {
  const random = globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 18);
  return `rv-${random}`;
}

/** The current calendar month, as the usage meter stores it. */
export function currentPeriod(now: Date = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Repurposer runs a free workspace gets each calendar month. */
export const FREE_GENERATIONS_PER_MONTH = 6;
