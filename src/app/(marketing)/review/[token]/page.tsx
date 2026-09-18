import type { Metadata } from "next";
import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import { Reveal, Spotlight } from "@/components/motion";
import { ReviewPanel, type ReviewPanelItem } from "@/components/review-panel";
import { CtaBand, ProductFrame, Section, SectionHeader } from "@/components/sections";
import { demoApprovalItemsWithDates } from "@/content/demo";
import { reviewPath } from "@/lib/approvals";
import { db } from "@/lib/db";
import { features } from "@/lib/env";

type Params = { params: Promise<{ token: string }> };

export const metadata: Metadata = {
  title: "Review this post",
  description: "One post, one decision. Approve it or send it back with a note.",
};

/**
 * The link the client is actually sent.
 *
 * The token is the whole credential, so the lookup is by token and nothing
 * else: no session, no workspace, no other row reachable from here. An unknown
 * token is a 404 rather than a hint that some other post exists.
 */
async function load(token: string): Promise<{ item: ReviewPanelItem; canDecide: boolean } | null> {
  if (features.db) {
    const row = await db.approvalItem.findUnique({ where: { reviewToken: token } });
    if (row) return { item: row, canDecide: true };
    return null;
  }

  /* No database on this preview: the seeded row keeps the link readable, with
     the decision buttons explained instead of faked. */
  const demo = demoApprovalItemsWithDates().find((item) => item.reviewToken === token);
  return demo ? { item: demo, canDecide: false } : null;
}

export default async function ReviewTokenPage({ params }: Params): Promise<ReactElement> {
  const { token } = await params;
  const found = await load(token);
  if (!found) notFound();

  const { item, canDecide } = found;
  const waiting = item.state === "PENDING";

  return (
    <>
      <Section width="content" space="section">
        <SectionHeader
          as="h1"
          eyebrow={item.clientName}
          title={waiting ? "One post is waiting on you" : "This post already has a decision"}
          description={
            waiting
              ? "Read it the way it will go out, then approve it or send it back with a note. No account needed."
              : "The first decision is the record. It is shown here exactly as the agency sees it."
          }
        />

        <Reveal className="mt-stack block">
          <Spotlight>
            <ProductFrame label={reviewPath(item.reviewToken)}>
              <div className="p-5 sm:p-8">
                <ReviewPanel item={item} canDecide={canDecide} />
              </div>
            </ProductFrame>
          </Spotlight>
        </Reveal>
      </Section>

      <CtaBand
        title="The paper trail writes itself."
        body="Approvalrail keeps every decision, every note and every timestamp beside the post it belongs to."
        primary={{ label: "Start the queue", href: "/sign-up" }}
        secondary={{ label: "How it works", href: "/" }}
      />
    </>
  );
}
