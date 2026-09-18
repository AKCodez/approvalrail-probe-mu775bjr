"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { generateObjectSafe } from "@/lib/ai";
import { newReviewToken, PLATFORMS, platformLabel, type Platform } from "@/lib/approvals";
import { db } from "@/lib/db";
import { features } from "@/lib/env";
import type { FormState } from "@/lib/form-state";
import { draftingSystemPrompt, PLATFORM_LIMITS, plainCut } from "@/lib/repurpose";
import { getCurrentUser } from "@/lib/session";
import { getUsage, recordGeneration } from "@/lib/usage";
import { getOrCreateWorkspace } from "@/lib/workspace";

/**
 * One long-form asset in, one draft per platform out, straight into the queue.
 *
 * The drafts are written as ordinary `ApprovalItem` rows in DRAFT state, so
 * they are edited, sent for review and approved by exactly the same machinery
 * as anything else. Nothing here can publish and nothing here can approve.
 *
 * The pasted asset is user input, so it only ever travels in `prompt`. The
 * rules travel in `system`.
 */

const inputSchema = z.object({
  clientName: z
    .string()
    .min(2, "Pick the client this is for.")
    .max(80, "Keep the client name under 80 characters."),
  assetTitle: z
    .string()
    .min(4, "Give the asset a title. It goes on every draft cut from it.")
    .max(160, "Keep the title under 160 characters."),
  assetBody: z
    .string()
    .min(200, "Paste the whole asset. A repurposer needs a few paragraphs to work from.")
    .max(20000, "That asset is too long. Paste the section you want posts from."),
});

const draftSchema = z.object({
  body: z.string().min(20).max(5000),
});

type DraftedBody = { platform: Platform; body: string; fromModel: boolean };

/** One platform's draft. Falls back to a plain cut rather than failing the run. */
async function draftOne(
  platform: Platform,
  title: string,
  asset: string,
): Promise<DraftedBody | null> {
  const result = await generateObjectSafe({
    schema: draftSchema,
    system: draftingSystemPrompt(platform),
    prompt: [
      `Source asset title: ${title}`,
      "",
      "Source asset:",
      asset,
      "",
      `Write the ${platformLabel(platform)} post now.`,
    ].join("\n"),
  });

  if (result.ok) {
    return {
      platform,
      body: result.object.body.slice(0, PLATFORM_LIMITS[platform] + 400).trim(),
      fromModel: true,
    };
  }

  const cut = plainCut(platform, title, asset);
  return cut.length >= 20 ? { platform, body: cut, fromModel: false } : null;
}

export async function repurposeAsset(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { status: "error", message: "Sign in to draft from an asset." };
  if (!features.db) {
    return { status: "error", message: "Set DATABASE_URL to draft into the queue." };
  }

  const parsed = inputSchema.safeParse({
    clientName: String(formData.get("clientName") ?? "").trim(),
    assetTitle: String(formData.get("assetTitle") ?? "").trim(),
    assetBody: String(formData.get("assetBody") ?? "").trim(),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  const selected = formData
    .getAll("platforms")
    .map((value) => String(value))
    .filter((value): value is Platform => (PLATFORMS as readonly string[]).includes(value));
  if (selected.length === 0) {
    return { status: "error", message: "Tick at least one platform to draft for." };
  }

  const workspace = await getOrCreateWorkspace(user.id);
  if (!workspace) return { status: "error", message: "That workspace is gone." };

  const usage = await getUsage(user.id, workspace.id);
  if (usage.gated) {
    return {
      status: "error",
      message: `That is all ${usage.limit} drafting runs for this month. Upgrade to keep drafting, or send what is already in the queue.`,
    };
  }

  const drafted = (
    await Promise.all(
      selected.map((platform) => draftOne(platform, parsed.data.assetTitle, parsed.data.assetBody)),
    )
  ).filter((draft): draft is DraftedBody => draft !== null);

  if (drafted.length === 0) {
    return {
      status: "error",
      message: "Drafting did not come back. Your asset is still here, so press Draft again.",
    };
  }

  const actor = user.name || user.email;
  await Promise.all(
    drafted.map((draft) =>
      db.approvalItem.create({
        data: {
          workspaceId: workspace.id,
          clientName: parsed.data.clientName,
          platform: draft.platform,
          body: draft.body,
          sourceAssetTitle: parsed.data.assetTitle,
          state: "DRAFT",
          reviewToken: newReviewToken(),
          events: { create: { action: "CREATED", actor } },
        },
      }),
    ),
  );

  await recordGeneration(workspace.id);

  revalidatePath("/repurpose");
  revalidatePath("/queue");
  revalidatePath("/dashboard");

  const count = `${drafted.length} draft${drafted.length === 1 ? "" : "s"}`;
  const modelled = drafted.filter((draft) => draft.fromModel).length;

  if (modelled === 0) {
    return {
      status: "degraded",
      message: `${count} cut straight from the asset and dropped into the queue. Drafting is not configured on this deployment, so these are plain cuts to edit rather than written posts.`,
    };
  }
  if (modelled < drafted.length) {
    return {
      status: "degraded",
      message: `${count} in the queue. ${drafted.length - modelled} came back as a plain cut of the asset instead of a written post.`,
    };
  }

  return { status: "ok", message: `${count} in the queue, each cut from your asset.` };
}
