"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { features } from "@/lib/env";
import type { FormState } from "@/lib/form-state";
import { reviewPath } from "@/lib/approvals";

/**
 * The two decisions a client can make, from a page with no login on it.
 *
 * There is no session here on purpose: the review token IS the credential, so
 * every query is scoped by it and nothing else is reachable from this action.
 * A token only opens one row, and a row that has already been decided is never
 * overwritten - the first decision is the record.
 */

const decisionSchema = z.object({
  token: z.string().min(6, "That review link is not valid."),
  reviewerName: z
    .string()
    .min(2, "Type your name so the approval has someone on it.")
    .max(80, "Keep the name under 80 characters."),
});

const noteSchema = z
  .string()
  .min(4, "A rejection needs a note. Say what to change.")
  .max(600, "Keep the note under 600 characters.");

type Resolved = { id: string; token: string } | { error: FormState };

async function resolve(formData: FormData): Promise<Resolved> {
  if (!features.db) {
    return { error: { status: "error", message: "This preview has no database, so nothing can be recorded." } };
  }

  const parsed = decisionSchema.safeParse({
    token: String(formData.get("token") ?? "").trim(),
    reviewerName: String(formData.get("reviewerName") ?? "").trim(),
  });
  if (!parsed.success) {
    return {
      error: { status: "error", message: parsed.error.issues[0]?.message ?? "Check the form." },
    };
  }

  const item = await db.approvalItem.findUnique({
    where: { reviewToken: parsed.data.token },
    select: { id: true, state: true, decidedAt: true },
  });
  if (!item) return { error: { status: "error", message: "That review link is not valid." } };
  if (item.decidedAt !== null) {
    return { error: { status: "error", message: "This post already has a decision on the record." } };
  }

  return { id: item.id, token: parsed.data.token };
}

function refresh(token: string): void {
  revalidatePath(reviewPath(token));
  revalidatePath("/review");
  revalidatePath("/queue");
  revalidatePath("/dashboard");
}

/** Approve: the reviewer's name and the time go on the row, permanently. */
export async function approveItem(_prev: FormState, formData: FormData): Promise<FormState> {
  const resolved = await resolve(formData);
  if ("error" in resolved) return resolved.error;

  const reviewerName = String(formData.get("reviewerName") ?? "").trim();

  await db.approvalItem.update({
    where: { id: resolved.id },
    data: {
      state: "APPROVED",
      reviewerName,
      decidedAt: new Date(),
      decisionNote: null,
      events: { create: { action: "APPROVED", actor: reviewerName } },
    },
  });

  refresh(resolved.token);
  return { status: "ok", message: `Approved. Recorded against ${reviewerName}.` };
}

/** Reject: the note is required, and it reaches the queue row word for word. */
export async function rejectItem(_prev: FormState, formData: FormData): Promise<FormState> {
  const resolved = await resolve(formData);
  if ("error" in resolved) return resolved.error;

  const reviewerName = String(formData.get("reviewerName") ?? "").trim();
  const note = noteSchema.safeParse(String(formData.get("note") ?? "").trim());
  if (!note.success) {
    return { status: "error", message: note.error.issues[0]?.message ?? "Add a note." };
  }

  await db.approvalItem.update({
    where: { id: resolved.id },
    data: {
      state: "REJECTED",
      reviewerName,
      decidedAt: new Date(),
      decisionNote: note.data,
      events: { create: { action: "REJECTED", actor: reviewerName, note: note.data } },
    },
  });

  refresh(resolved.token);
  return { status: "ok", message: "Rejected. Your note is on the row." };
}
