export type CompareRow = {
  feature: string;
  us: string;
  them: string;
};

export type CompareEntry = {
  /** URL segment: /compare/<slug> */
  slug: string;
  /** Page headline. */
  title: string;
  /** What you are being compared against. */
  incumbent: string;
  /** One-sentence summary under the headline. */
  summary: string;
  rows: CompareRow[];
};

/**
 * Comparison pages are the ONE place a competitor may be named. Product copy
 * everywhere else stands on its own. Every claim in `them` is taken from what
 * the product says about itself on its own site.
 */
export const compareEntries: CompareEntry[] = [
  {
    slug: "postpeer",
    title: "Where a posting API stops and an approval layer starts",
    incumbent: "PostPeer",
    summary:
      "PostPeer is a unified posting API for developers and AI agents: one endpoint, seven platforms. Approvalrail is the layer above it, for the account manager who has to get a client to say yes first.",
    rows: [
      {
        feature: "Client sign-off before publish",
        us: "A hosted review link per post. Release is refused until an approval is on the record.",
        them: "Not offered as a product surface; you build the screens yourself.",
      },
      {
        feature: "Audit trail",
        us: "Reviewer name, timestamp and note on every state change, kept as immutable rows.",
        them: "API logs, no human record of who decided what.",
      },
      {
        feature: "Who it is for",
        us: "Agency account managers and the clients who sign off.",
        them: "Developers and AI agents wiring endpoints.",
      },
      {
        feature: "Turning one asset into many posts",
        us: "Paste a long-form asset and get platform-native drafts in the queue, each linked to the source.",
        them: "You send finished content, per platform, already written.",
      },
      {
        feature: "Queue visibility",
        us: "One board across every client account, with the approval state on each slot.",
        them: "Query the scheduling endpoint and render it yourself.",
      },
      {
        feature: "Reporting",
        us: "Approval turnaround, rejection reasons, and who is holding the queue.",
        them: "Platform metrics and comment endpoints.",
      },
      {
        feature: "Setup",
        us: "Sign in, paste an asset, send a review link.",
        them: "API key, SDK wiring, and hosting your own interface.",
      },
    ],
  },
];

export function getCompareEntry(slug: string): CompareEntry | undefined {
  return compareEntries.find((entry) => entry.slug === slug);
}
