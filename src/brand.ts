import type { Brand } from "@/design/types";

export const brand = {
  "name": "Approvalrail",
  "tagline": "Client sign-off on the record, before a single post goes out",
  "wordmark": {
    "case": "title",
    "tracking": "tight",
    "weight": 600,
    "monogram": {
      "letters": "AR",
      "shape": "square"
    }
  },
  "direction": "editorial",
  "scheme": "light",
  "palette": {
    "accentHue": 268,
    "accentChroma": 0.15,
    "neutrals": "cool"
  },
  "type": {
    "display": "instrument-serif",
    "body": "inter-tight",
    "mono": "jetbrains-mono"
  },
  "motion": {
    "intensity": "calm",
    "durationScale": 1.05
  },
  "voice": {
    "adjectives": [
      "composed",
      "accountable",
      "precise"
    ],
    "phrases": [
      "Nothing publishes without a name beside it.",
      "A review link your client can actually read.",
      "Every approval, every edit, kept in order.",
      "Forty accounts, one queue, one rule.",
      "The paper trail writes itself."
    ],
    "avoid": [
      "blazing fast",
      "effortless",
      "magic",
      "revolutionary",
      "10x",
      "supercharge",
      "game-changer",
      "hustle",
      "PostPeer"
    ]
  },
  "imagery": {
    "rules": [
      "Show the approval ledger itself: timestamped rows, reviewer names, state changes",
      "Screens on soft paper-white cards with a single hairline rule, no drop shadows",
      "Accent violet reserved for pending and approved states, never for decoration",
      "Real client-facing review pages, not abstract dashboards",
      "Portraits only as small circular reviewer avatars inside the record",
      "No platform logo confetti, no floating app icons",
      "Generous white margins; let one artifact carry the frame"
    ]
  },
  "composition": {
    "hero": "ledger",
    "bento": "dense",
    "stats": "rows"
  },
  "credit": {
    "startupUrl": "https://ideawave.io/startup/postpeer",
    "builtInMinutes": null
  },
  "meta": {
    "generator": "ideawave-clone-studio",
    "version": 1,
    "buildId": "cmu60b3vt000hcow6mvynihgt"
  }
} as const satisfies Brand;

export default brand;
