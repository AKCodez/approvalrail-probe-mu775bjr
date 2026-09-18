"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { features } from "@/lib/env";
import type { FormState } from "@/lib/form-state";
import { getCurrentUser } from "@/lib/session";
import { getWorkspace } from "@/lib/workspace";

/**
 * The writes behind the approval queue.
 *
 * Every one of them checks the session here, inside the action, and scopes the
 * row by the workspace the signed-in account owns. A disabled button is a
 * courtesy; this is the permission system.
 *
 * Nothing is deleted and no decision is overwritten in place: each state change
 * also writes an immutable `AuditEvent`, which is the paper trail the product
 * is named after.
 */

const idSchema = z.string().min(1, "That row is gone.");

type Scoped = { itemId: string; actor: string } | { error: FormState };

/** Session, workspace and ownership, resolved once per action. */
async function scope(formData: FormData): Promise<Scoped> {
  const user = await getCurrentUser();
  if (!user) return { error: { status: "error", message: "Sign in to move a row." } };
  if (!features.db) {
    return { error: { status: "error", message: "Set DATABASE_URL to move a row." } };
  }

  const parsed = idSchema.safeParse(String(formData.get("id") ?? ""));
  if (!parsed.success) return { error: { status: "error", message: "That row is gone." } };

  const workspace = await getWorkspace(user.id);
  if (!workspace) return { error: { status: "error", message: "That row is gone." } };

  const item = await db.approvalItem.findFirst({
    where: { id: parsed.data, workspaceId: workspace.id },
    select: { id: true },
  });
  if (!item) return { error: { status: "error", message: "That row is gone." } };

  return { itemId: item.id, actor: user.name || user.email };
}

function revalidate(): void {
  revalidatePath("/queue");
  revalidatePath("/dashboard");
  revalidatePath("/repurpose");
}

/**
 * Draft to pending. The review link already exists on the row, so sending for
 * review is a state change and a ledger row, not a new secret.
 */
export async function sendForReview(_prev: FormState, formData: FormData): Promise<FormState> {
  const resolved = await scope(formData);
  if ("error" in resolved) return resolved.error;

  const item = await db.approvalItem.findUnique({
    where: { id: resolved.itemId },
    select: { state: true },
  });
  if (!item) return { status: "error", message: "That row is gone." };
  if (item.state === "PENDING") {
    return { status: "ok", message: "Already with the client." };
  }
  if (item.state === "APPROVED" || item.state === "SCHEDULED") {
    return { status: "error", message: "That row is already approved." };
  }

  await db.approvalItem.update({
    where: { id: resolved.itemId },
    data: {
      state: "PENDING",
      reviewerName: null,
      decidedAt: null,
      decisionNote: null,
      events: { create: { action: "SENT_FOR_REVIEW", actor: resolved.actor } },
    },
  });

  revalidate();
  return { status: "ok", message: "Sent. The review link is on the row." };
}

/**
 * Approved to released. The state is checked again here because the button
 * being enabled proves nothing: a row can be rejected between the render and
 * the click.
 */
export async function releaseToSchedule(_prev: FormState, formData: FormData): Promise<FormState> {
  const resolved = await scope(formData);
  if ("error" in resolved) return resolved.error;

  const item = await db.approvalItem.findUnique({
    where: { id: resolved.itemId },
    select: { state: true, scheduledFor: true },
  });
  if (!item) return { status: "error", message: "That row is gone." };
  if (item.state !== "APPROVED") {
    return {
      status: "error",
      message: "Only an approved row can be released. This one moved while you were looking at it.",
    };
  }

  const slot = item.scheduledFor ?? new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.approvalItem.update({
    where: { id: resolved.itemId },
    data: {
      state: "SCHEDULED",
      releasedAt: new Date(),
      scheduledFor: slot,
      events: { create: { action: "RELEASED", actor: resolved.actor } },
    },
  });

  revalidate();
  return { status: "ok", message: "Released to the schedule." };
}

const bodySchema = z
  .string()
  .min(10, "A post needs at least a sentence.")
  .max(5000, "That is longer than any platform will take.");

/** Edits a draft before it goes out for review. Approved rows are frozen. */
export async function updateDraftBody(_prev: FormState, formData: FormData): Promise<FormState> {
  const resolved = await scope(formData);
  if ("error" in resolved) return resolved.error;

  const parsed = bodySchema.safeParse(String(formData.get("body") ?? "").trim());
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the text." };
  }

  const item = await db.approvalItem.findUnique({
    where: { id: resolved.itemId },
    select: { state: true },
  });
  if (!item) return { status: "error", message: "That row is gone." };
  if (item.state === "APPROVED" || item.state === "SCHEDULED") {
    return { status: "error", message: "An approved post cannot be edited. Send a new draft." };
  }

  await db.approvalItem.update({
    where: { id: resolved.itemId },
    data: {
      body: parsed.data,
      events: { create: { action: "EDITED", actor: resolved.actor } },
    },
  });

  revalidate();
  return { status: "ok", message: "Draft saved." };
}
