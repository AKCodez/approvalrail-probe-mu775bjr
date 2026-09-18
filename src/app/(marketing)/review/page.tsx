import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import { TrayIcon } from "@phosphor-icons/react/dist/ssr";
import { Spotlight } from "@/components/motion";
import { ReviewPanel } from "@/components/review-panel";
import { CtaBand, ProductFrame, Section, SectionHeader } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { demoApprovalItemsWithDates } from "@/content/demo";
import { reviewPath } from "@/lib/approvals";
import { db } from "@/lib/db";
import { features } from "@/lib/env";

/* The waiting post changes with every decision, so this page is never cached
   into the build the way the rest of the marketing routes are. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Client review",
  description: "Read the post as it will appear, then approve it or reject it with a note.",
};

/**
 * The login-free review page.
 *
 * With no token in the URL it opens the post that has been waiting longest, so
 * a visitor can read a real review link without an account. The real link a
 * client is sent carries its token: /review/<token>.
 */
export default async function ReviewIndexPage(): Promise<ReactElement> {
  const live = features.db
    ? await db.approvalItem.findFirst({
        where: { state: "PENDING" },
        orderBy: { createdAt: "asc" },
      })
    : null;

  /* No database on this preview: the seeded row is still the honest thing to
     show, with the buttons explained rather than faked. */
  const fallback = demoApprovalItemsWithDates().find((item) => item.state === "PENDING");
  const item = live ?? fallback ?? null;

  return (
    <>
      <Section width="content" space="section">
        <SectionHeader
          as="h1"
          eyebrow="Client review"
          title="A review link your client can actually read"
          description="No login, no account, one post. Approving puts the reviewer's name and the time on the record, and nothing is released until it is there."
        />

        <div className="mt-stack">
          {item ? (
            <Spotlight>
              <ProductFrame label={reviewPath(item.reviewToken)}>
                <div className="p-5 sm:p-8">
                  <ReviewPanel item={item} canDecide={live !== null} />
                </div>
              </ProductFrame>
            </Spotlight>
          ) : (
            <EmptyState
              icon={<TrayIcon aria-hidden="true" weight="regular" className="size-8" />}
              title="Nothing is waiting on a client right now"
              body="A post appears here the moment someone presses Send for review in the queue. Each one gets its own link, which opens without a login."
              action={
                <Button asChild variant="primary" size="md">
                  <Link href="/queue">Open the queue</Link>
                </Button>
              }
            />
          )}
        </div>
      </Section>

      <CtaBand
        title="Every approval, every edit, kept in order."
        body="Send the link, get a name and a timestamp back, release the post. That is the whole loop."
        primary={{ label: "Start the queue", href: "/sign-up" }}
        secondary={{ label: "See the queue", href: "/queue" }}
      />
    </>
  );
}
