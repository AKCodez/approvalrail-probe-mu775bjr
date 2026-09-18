/**
 * Every word on the public pages, in one file.
 *
 * Copy rules: plain hyphens, short sentences, no invented testimonials, no user
 * counts, no revenue claims. Say what the product does, not what category it
 * belongs to. Every number here is counted from the product itself.
 */

export type Benefit = { title: string; body: string; span?: 1 | 2 };
export type Step = { title: string; body: string };
export type Stat = { value: number; label: string; suffix?: string; prefix?: string };
export type Faq = { question: string; answer: string };
export type Plan = {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: readonly string[];
  featured?: boolean;
};

export const hero = {
  eyebrow: "Approval workflow for agencies",
  headline: "Nothing publishes without a name beside it.",
  sub: "Approvalrail holds every client post in one queue and refuses to release it until an approval is on the record, with a reviewer name and a timestamp.",
  primaryCta: { label: "Start the queue", href: "/sign-up" },
  secondaryCta: { label: "See a review link", href: "/review" },
  note: "Free to read the queue and send one live client review link. No card.",
} as const;

export const frame = {
  eyebrow: "The approval ledger",
  title: "Six accounts, one queue, one rule.",
  body: "This is the queue itself, running on the same seeded rows a new account gets. Each row carries its client, its platform, its slot and the state that decides whether it can be released.",
} as const;

export const benefits: readonly Benefit[] = [
  {
    title: "The release is the gate",
    body: "Release to schedule only unlocks on a row a client has approved. On every other row the button stays visible and disabled with the blocking state named, so an account manager can see who is holding the queue without asking.",
    span: 2,
  },
  {
    title: "A review link your client can actually read",
    body: "No login, no seat, no invite. The post renders in its platform shape, and approving puts the reviewer's name on the record.",
  },
  {
    title: "One asset, platform-native drafts",
    body: "Paste a blog post, pick the client and the platforms, and each draft lands in the queue with a visible line back to the asset it was cut from.",
  },
  {
    title: "The paper trail writes itself",
    body: "Every state change writes an immutable row: who moved it, when, and the rejection note in their own words. The argument about what was approved never happens twice.",
    span: 2,
  },
  {
    title: "Grouped by client, not by date",
    body: "Six accounts read as six sections, each with its own pending count, rather than one endless list.",
  },
  {
    title: "Rejections come back with a reason",
    body: "A reject needs a note. It lands on the queue row verbatim, so the rewrite starts from what the client said, in the words the client used. Edit the draft, send it again, and the ledger keeps both rounds.",
    span: 2,
  },
];

/** The three states an account manager needs to recognise on sight. */
export const queueBento: readonly Benefit[] = [
  {
    title: "Draft and pending",
    body: "A draft is yours to edit. Send for review turns it pending and opens the review link. Nothing is released from either state.",
  },
  {
    title: "Approved",
    body: "A client decided, and their name and the timestamp are on the row. This is the only state Release to schedule accepts.",
  },
  {
    title: "Rejected",
    body: "The note the client wrote sits on the row. Edit the post and send it for review again; the ledger keeps both rounds.",
  },
];

/** The four moves the repurposer page itself walks through. */
export const repurposeSteps: readonly Step[] = [
  {
    title: "Paste the asset",
    body: "A blog post, a newsletter, a transcript. Give it the title the client will recognise, because that title rides on every draft.",
  },
  {
    title: "Pick the client and the platforms",
    body: "The selector is filled from the accounts this workspace runs. One draft comes back per platform you tick.",
  },
  {
    title: "Edit in the queue",
    body: "Drafts arrive editable and unsent. Change a line, cut a paragraph, then send the ones you are happy with.",
  },
  {
    title: "Send for review",
    body: "Each draft already carries its review link. The client sees the post and the asset it was cut from.",
  },
];

export const repurposeBento: readonly Benefit[] = [
  {
    title: "The source line travels",
    body: "Every draft keeps the asset title on it, all the way to the review page. A client can see what a post was cut from without asking.",
  },
  {
    title: "Nothing skips the queue",
    body: "A generated draft is an ordinary draft: unsent, editable, and blocked from release until an approval is on the record.",
  },
  {
    title: "Per platform, not per paste",
    body: "A thread, a caption and a post are three different shapes. Each one is drafted for its own platform rather than copied across.",
  },
];

export const steps: readonly Step[] = [
  {
    title: "Paste the asset",
    body: "One long-form piece, a client account, and the platforms you want. The repurposer writes a draft for each one.",
  },
  {
    title: "Send for review",
    body: "Each draft gets a link with no login behind it. Send it in whatever channel the client already answers in.",
  },
  {
    title: "The client decides",
    body: "Approve with a name, or reject with a note. Either way the decision is timestamped and immutable.",
  },
  {
    title: "Release to schedule",
    body: "Approved rows unlock. Everything else stays blocked, and the queue says exactly why.",
  },
];

/** Counted from the product, not estimated. */
export const stats: readonly Stat[] = [
  { value: 5, label: "Platforms the repurposer drafts for" },
  { value: 4, label: "States every post moves through" },
  { value: 1, label: "Approval required before a release" },
  { value: 0, label: "Logins a client reviewer needs" },
];

export const plans: readonly Plan[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    description: "Read the queue, run one live client review link.",
    features: [
      "The full approval queue",
      "One live client review link",
      "Six repurposer runs a month",
    ],
  },
  {
    name: "Agency",
    price: "$19",
    cadence: "per month",
    description: "For an agency running every client account through one queue.",
    features: [
      "Everything in Free",
      "Unlimited review links and repurposer runs",
      "Turnaround reporting per client",
      "Cancel from the billing portal",
    ],
    featured: true,
  },
];

export const pricingNote =
  "One plan, monthly, cancelled from the Stripe billing portal whenever you like. The amount is charged by Stripe, so what you see at checkout is what you pay.";

export const faqs: readonly Faq[] = [
  {
    question: "Does Approvalrail publish the post for me?",
    answer:
      "Not at launch. A release is recorded against the slot, with the approval attached, and the post goes out through whatever you already use. The rule we enforce is that nothing leaves the queue unapproved.",
  },
  {
    question: "Does the client need an account?",
    answer:
      "No. The review link opens without a login. They read the post as it will appear, type their name, and approve or reject with a note.",
  },
  {
    question: "What stops someone releasing a post nobody approved?",
    answer:
      "The action itself. Release checks the state on the server, not in the browser, so a rejected or pending row cannot be released even by someone who goes looking for the button.",
  },
  {
    question: "What happens to a rejection?",
    answer:
      "The note is stored with the reviewer name and the timestamp, and shows on the queue row word for word. Edit the draft and send it again; both rounds stay in the ledger.",
  },
  {
    question: "Where do the drafts come from?",
    answer:
      "You paste one long-form asset and choose the platforms. Each draft keeps a line back to the source asset title, so the client can see what it was cut from. Drafts are editable before anything is sent.",
  },
];

export const ctaBand = {
  title: "Put the sign-off on the record.",
  body: "Create an account and the demo workspace is already in the queue, states and all.",
  primary: { label: "Start the queue", href: "/sign-up" },
  secondary: { label: "Read a review link", href: "/review" },
} as const;

/** The SEO beachhead page at /content-repurposing-tool-for-agencies. */
export const repurposingPage = {
  title: "A content repurposing tool for agencies, with sign-off built in",
  sub: "Turn one blog post into platform-native drafts for every client account, then hold each one until the client approves it by name.",
  benefits: [
    {
      title: "Repurposing without the handoff",
      body: "The drafts do not land in a doc for someone to copy out. They land in the approval ledger, already attached to the client account they belong to.",
      span: 2,
    },
    {
      title: "One source, many shapes",
      body: "An X thread, an Instagram caption, a LinkedIn post and a Threads post from the same asset, each written to its own length.",
    },
    {
      title: "Every draft is editable",
      body: "Nothing is sent until you send it. Fix the opening line, then push it to the client.",
    },
  ] satisfies readonly Benefit[],
  faqs: [
    {
      question: "What counts as a long-form asset?",
      answer:
        "A blog post, a transcript, a newsletter, a case study. Anything with enough in it to cut four posts from.",
    },
    {
      question: "Can each client have their own reviewer?",
      answer:
        "Yes. The review link is per post, so the person who signs off for one client never sees another client's queue.",
    },
    {
      question: "Is the approval step optional?",
      answer:
        "The queue will hold a draft as long as you like, but release needs an approval. That is the product.",
    },
  ] satisfies readonly Faq[],
} as const;
