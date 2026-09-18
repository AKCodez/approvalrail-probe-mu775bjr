import { db } from "@/lib/db";
import { features } from "@/lib/env";
import { currentPeriod, FREE_GENERATIONS_PER_MONTH } from "@/lib/approvals";

/**
 * The repurposer's meter.
 *
 * A free workspace gets a fixed number of drafting runs a calendar month, and
 * the count is a row rather than a guess, so the page and the action agree on
 * the same number. Premium is read from `user.premiumUntil`, which only the
 * Stripe webhook writes.
 */
export type UsageSnapshot = {
  period: string;
  used: number;
  /** Null when the workspace is on the paid plan. */
  limit: number | null;
  /** Null when there is no limit. Never below zero. */
  remaining: number | null;
  /** True when the next run has to be paid for. */
  gated: boolean;
  premium: boolean;
};

export async function getUsage(
  userId: string,
  workspaceId: string,
  now: Date = new Date(),
): Promise<UsageSnapshot> {
  const period = currentPeriod(now);

  if (!features.db) {
    return {
      period,
      used: 0,
      limit: FREE_GENERATIONS_PER_MONTH,
      remaining: FREE_GENERATIONS_PER_MONTH,
      gated: false,
      premium: false,
    };
  }

  const [user, meter] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { premiumUntil: true } }),
    db.usageMeter.findUnique({
      where: { workspaceId_period: { workspaceId, period } },
      select: { generations: true },
    }),
  ]);

  const premium = user?.premiumUntil !== null && (user?.premiumUntil ?? now) > now;
  const used = meter?.generations ?? 0;

  if (premium) {
    return { period, used, limit: null, remaining: null, gated: false, premium: true };
  }

  const remaining = Math.max(0, FREE_GENERATIONS_PER_MONTH - used);
  return {
    period,
    used,
    limit: FREE_GENERATIONS_PER_MONTH,
    remaining,
    gated: remaining === 0,
    premium: false,
  };
}

/** One more run on the meter for this month. Called after drafts are written. */
export async function recordGeneration(
  workspaceId: string,
  now: Date = new Date(),
): Promise<void> {
  const period = currentPeriod(now);
  await db.usageMeter.upsert({
    where: { workspaceId_period: { workspaceId, period } },
    create: { workspaceId, period, generations: 1 },
    update: { generations: { increment: 1 } },
  });
}
