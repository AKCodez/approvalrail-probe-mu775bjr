import type { ReactElement } from "react";
import {
  Bento,
  Compare,
  CtaBand,
  Faq,
  Hero,
  Pricing,
  ProductFrame,
  Stats,
  Steps,
} from "@/components/sections";
import { ApprovalQueue } from "@/components/approval-queue";
import { Grain } from "@/components/motion";
import { demoApprovalItemsWithDates } from "@/content/demo";
import { getCompareEntry } from "@/content/compare";
import {
  benefits,
  ctaBand,
  faqs,
  frame,
  hero,
  plans,
  pricingNote,
  stats,
  steps,
} from "@/content/marketing";

/**
 * The landing page, composed from the kit.
 *
 * The hero carries the queue itself, running on the same seeded rows a new
 * account is given, so the first screen is the product rather than a picture of
 * it. Everything under it answers one question each: what it does, how it
 * works, what is true, how it differs, what it costs, and what people ask.
 */
export default function HomePage(): ReactElement {
  const rows = demoApprovalItemsWithDates().filter((item) =>
    ["Northgate Dental", "Lumen Fitness"].includes(item.clientName),
  );

  const comparison = getCompareEntry("postpeer");

  return (
    <>
      <Grain />

      <Hero
        eyebrow={hero.eyebrow}
        headline={hero.headline}
        sub={hero.sub}
        primary={hero.primaryCta}
        secondary={hero.secondaryCta}
        note={hero.note}
        frame={
          <ProductFrame label={`${frame.eyebrow} - live`}>
            <ApprovalQueue items={rows.slice(0, 4)} density="compact" />
          </ProductFrame>
        }
      />

      <Bento
        id="what"
        items={benefits}
        eyebrow={frame.eyebrow}
        title={frame.title}
        description={frame.body}
      />

      <Steps
        id="how"
        steps={steps}
        eyebrow="How a round goes"
        title="Asset in, approval on the record"
        description="Four steps, and the last one is the only way a post leaves the queue."
      />

      <Stats stats={stats} title="Counted, not claimed" />

      {comparison ? <Compare entry={comparison} id="compare" showHeading={false} /> : null}

      <Pricing
        id="pricing"
        plans={plans}
        note={pricingNote}
        eyebrow="Pricing"
        title="One plan, one price"
        description="Free while you are reading the queue. Nineteen dollars a month when the agency runs on it."
      />

      <Faq id="faq" items={faqs} eyebrow="Questions" title="Before you send the first link" />

      <CtaBand
        title={ctaBand.title}
        body={ctaBand.body}
        primary={ctaBand.primary}
        secondary={ctaBand.secondary}
      />
    </>
  );
}
