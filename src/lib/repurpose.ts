/**
 * Turning one long-form asset into one post per platform.
 *
 * The briefs and the limits live here so the action, the form and the tests
 * all read the same rules. Nothing here touches the database, the session or
 * the network: `plainCut` is the deterministic fallback used when the model is
 * not available, so the feature still produces editable drafts on a deployment
 * with no AI key, and the UI says plainly that it was a cut rather than a draft.
 */
import { platformLabel, type Platform } from "@/lib/approvals";

/** Roughly what each platform will accept in one post. */
export const PLATFORM_LIMITS: Record<Platform, number> = {
  X: 900,
  INSTAGRAM: 1400,
  LINKEDIN: 1600,
  THREADS: 480,
  FACEBOOK: 1200,
};

const PLATFORM_BRIEFS: Record<Platform, string> = {
  X: "Write a short thread. Number each post 1/, 2/, 3/ on its own line, four posts at most, each under 280 characters.",
  INSTAGRAM:
    "Write one caption. Open with the single most useful line, then three or four short lines, then one question. No hashtag wall: three at most, on the last line.",
  LINKEDIN:
    "Write one post. The first two lines have to carry it on their own, then short paragraphs, then one plain closing question.",
  THREADS: "Write one post under 480 characters. Conversational, one idea, no hashtags.",
  FACEBOOK:
    "Write one post. First three lines carry it, then two short paragraphs, then a plain invitation to get in touch.",
};

export function platformBrief(platform: Platform): string {
  return PLATFORM_BRIEFS[platform];
}

/** The instructions the model gets. Never contains anything a user typed. */
export function draftingSystemPrompt(platform: Platform): string {
  return [
    "You write social posts for a client account managed by an agency.",
    `The post is for ${platformLabel(platform)}. ${PLATFORM_BRIEFS[platform]}`,
    "Stay inside the source material. Invent no statistics, no offers, no dates and no testimonials.",
    "Plain hyphens only, never em dashes. No emoji unless the source uses them.",
    `Return JSON shaped { "body": string }, under ${PLATFORM_LIMITS[platform]} characters.`,
  ].join(" ");
}

/** Sentence-aware trim, so a cut never ends mid-word. */
function clip(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const slice = text.slice(0, limit);
  const stop = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("\n"));
  return (stop > limit * 0.4 ? slice.slice(0, stop + 1) : slice).trim();
}

function sentences(body: string): string[] {
  return body
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}

/**
 * A draft with no model behind it: the strongest lines of the asset, cut to
 * the platform's shape. It is a starting point an account manager edits, and
 * the UI labels it as one.
 */
export function plainCut(platform: Platform, title: string, body: string): string {
  const lines = sentences(body);
  const head = lines.slice(0, 5);
  const limit = PLATFORM_LIMITS[platform];

  if (platform === "X") {
    const posts = head.slice(0, 4).map((line, index) => `${index + 1}/ ${clip(line, 260)}`);
    return clip([title, ...posts].join("\n\n"), limit);
  }

  if (platform === "THREADS") {
    return clip([title, head.slice(0, 2).join(" ")].join("\n\n"), limit);
  }

  return clip([title, head.slice(0, 4).join(" ")].join("\n\n"), limit);
}
