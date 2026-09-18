# BRAND: Approvalrail

Client sign-off on the record, before a single post goes out

This file is the design contract. src/brand.ts already carries these values and generates the tokens;
you compose with them, you do not redesign them. Never write a literal colour, font or duration.

## Direction
- editorial in the light scheme. Approval is a matter of record, so a serif ledger with quiet margins reads as trustworthy documentation rather than another developer API pitch.
- Motion: calm, duration scale 1.05.
- Composition: ledger hero, dense bento, rows stats. The kit reads these from src/brand.ts; compose with the sections, do not restyle them.

## Type
- Display: Instrument Serif
- Body: Inter Tight
- Mono: JetBrains Mono

## Colour
- Accent: OKLCH hue 268, chroma 0.15 (about #4c6ac8, soft #e3ebff).
- Neutrals: cool.
- Use the semantic tokens only: canvas, surface, elevated, line, ink, muted, accent, on-accent.

## Wordmark
- Approvalrail set Title Case, tight tracking, weight 600.
- Monogram: "AR" on a square mark.

## Voice
- Sounds: composed, accountable, precise.
- Lines that belong on the page:
  - Nothing publishes without a name beside it.
  - A review link your client can actually read.
  - Every approval, every edit, kept in order.
  - Forty accounts, one queue, one rule.
  - The paper trail writes itself.
- Never use: blazing fast, effortless, magic, revolutionary, 10x, supercharge, game-changer, hustle.

## Imagery
- Show the approval ledger itself: timestamped rows, reviewer names, state changes
- Screens on soft paper-white cards with a single hairline rule, no drop shadows
- Accent violet reserved for pending and approved states, never for decoration
- Real client-facing review pages, not abstract dashboards
- Portraits only as small circular reviewer avatars inside the record
- No platform logo confetti, no floating app icons
- Generous white margins; let one artifact carry the frame

## Checklist
- [ ] Every page says Approvalrail, in the wordmark above.
- [ ] The landing page opens with the Hero of this direction and a live ProductFrame.
- [ ] Every interactive element has a hover and a press state.
- [ ] Copy reads in the voice above: the five lines are the tone to match, not text to paste.
- [ ] No literal colours, no Tailwind palette classes, no text-white.
- [ ] Empty states and skeletons exist wherever data can be absent.
- [ ] Plain hyphens everywhere, never em dashes.
- [ ] Never name PostPeer in the product: this is a different brand, and the compare page is the only place a competitor appears.
