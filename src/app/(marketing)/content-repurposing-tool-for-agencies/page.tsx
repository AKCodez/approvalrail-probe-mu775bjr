import type { Metadata } from "next";
import type { ReactElement } from "react";
import { ApprovalQueue } from "@/components/approval-queue";
import { Parallax } from "@/components/motion";
import { Bento, CtaBand, Faq, Hero, ProductFrame, Steps } from "@/components/sections";
import { demoApprovalItemsWithDates, demoSourceAsset } from "@/content/demo";
import { ctaBand, repurposeSteps, repurposingPage } from "@/content/marketing";

export const metadata: Metadata = {
  title: "Content repurposing tool for agencies",
  description:
    "Turn one blog post into platform-native drafts for every client account, then hold each draft until the client approves it by name.",
  alternates: { canonical: "/content-repurposing-tool-for-agencies" },
};

/**
 * The beachhead page for agencies searching for a repurposing workflow.
 *
 * It answers the search with the thing itself: the same approval ledger the
 * product runs on, filled with the drafts cut from one seeded asset.
 */
export default function RepurposingPage(): ReactElement {
  const cut = demoApprovalItemsWithDates().filter(
    (item) => item.sourceAssetTitle === demoSourceAsset.title,
  );

  return (
    <>
      <Hero
        eyebrow="Content repurposing tool for agencies"
        headline={repurposingPage.title}
        sub={repurposingPage.sub}
        primary={{ label: "Start the queue", href: "/sign-up" }}
        secondary={{ label: "Read a review link", href: "/review" }}
        note="Free while you are reading the queue. No card to look at a draft."
        frame={
          <Parallax>
            <ProductFrame label={`Approval ledger - cut from ${demoSourceAsset.title}`}>
              <ApprovalQueue items={cut} density="compact" />
            </ProductFrame>
          </Parallax>
        }
      />

      <Steps
        steps={repurposeSteps}
        eyebrow="The workflow"
        title="One asset, one client, one approved post at a time"
        description="The repurposing is the easy half. The half that costs agencies their evenings is getting the client to say yes in writing."
      />

      <Bento
        items={repurposingPage.benefits}
        eyebrow="Approval ledger"
        title="Drafts land in the ledger, not in a document"
        description="Every draft arrives attached to a client account, with the source asset title on it and a review link already waiting."
      />

      <Faq items={repurposingPage.faqs} eyebrow="Questions" title="What agencies ask first" />

      <CtaBand
        title={ctaBand.title}
        body={ctaBand.body}
        primary={{ label: "Start the queue", href: "/sign-up" }}
        secondary={ctaBand.secondary}
      />
    </>
  );
}
