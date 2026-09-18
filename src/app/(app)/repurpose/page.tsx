import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LockKeyIcon, SparkleIcon } from "@phosphor-icons/react/dist/ssr";
import { DraftEditor } from "@/components/draft-editor";
import { PageHeader } from "@/components/page-header";
import { RepurposeForm } from "@/components/repurpose-form";
import { Bento, Steps } from "@/components/sections";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { demoClients, demoSourceAsset } from "@/content/demo";
import { repurposeBento, repurposeSteps } from "@/content/marketing";
import { platformLabel } from "@/lib/approvals";
import { db } from "@/lib/db";
import { features } from "@/lib/env";
import { getCurrentUser } from "@/lib/session";
import { getUsage } from "@/lib/usage";
import { getWorkspace } from "@/lib/workspace";

export const metadata: Metadata = {
  title: "Asset repurposer",
  description: "Paste one long-form asset and get platform-native drafts inside the approval queue.",
};

const cutStamp = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

export default async function RepurposePage(): Promise<ReactElement> {
  // The (app) layout is the gate; this narrows the type for the queries below.
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const workspace = features.db ? await getWorkspace(user.id) : null;

  const drafts = workspace
    ? await db.approvalItem.findMany({
        where: { workspaceId: workspace.id, state: "DRAFT", sourceAssetTitle: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 12,
      })
    : [];

  const usage = workspace
    ? await getUsage(user.id, workspace.id)
    : { used: 0, limit: null, remaining: null, gated: false, premium: false, period: "" };

  /* A workspace with no client accounts yet still gets a usable selector: the
     demo accounts are the worked example the rest of the product is seeded
     with, and the field is free text when there are none. */
  const clients = workspace && workspace.clients.length > 0 ? workspace.clients : [];

  return (
    <div className="flex flex-col gap-stack">
      <PageHeader
        title="Asset repurposer"
        description="One long-form asset in, one platform-native draft out per platform. Every draft lands in the queue as a draft, carrying the title of the asset it was cut from."
        actions={
          <>
            <Badge tone="neutral">{drafts.length} drafts waiting</Badge>
            {usage.premium ? <Badge tone="accent">Agency plan</Badge> : null}
            <Button asChild variant="secondary" size="md">
              <Link href="/queue">Open the queue</Link>
            </Button>
          </>
        }
      />

      {usage.gated ? (
        <Card tone="accent" className="flex flex-col gap-4">
          <span aria-hidden="true" className="text-accent">
            <LockKeyIcon weight="regular" className="size-8" />
          </span>
          <div className="flex flex-col gap-2">
            <p className="text-h3 text-ink">
              That is all {usage.limit} drafting runs for this month
            </p>
            <p className="max-w-prose text-small text-muted">
              The free workspace gets {usage.limit} runs a calendar month. The queue, the review
              links and the ledger stay open either way: this gate is only on drafting. The Agency
              plan lifts it for $19 per month.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="primary" size="md">
              <Link href="/premium">See the Agency plan</Link>
            </Button>
            <Button asChild variant="ghost" size="md">
              <Link href="/queue">Send what is already drafted</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <p className="text-h3 text-ink">Paste the asset</p>
            <p className="text-small text-muted">
              A client selector, platform checkboxes and one paste field. Drafts arrive unsent, and
              nothing reaches a client until you press Send for review.
            </p>
          </div>
          <RepurposeForm
            clients={clients.length > 0 ? clients : demoClients.map((client) => client.name)}
            sample={demoSourceAsset}
            remaining={usage.remaining}
          />
        </Card>
      )}

      <section className="flex flex-col gap-stack">
        <div className="flex flex-col gap-1">
          <h2 className="text-h2 text-ink">Drafts cut from an asset</h2>
          <p className="text-small text-muted">
            Editable here, sent from here, approved in the queue. These are the rows the client has
            not seen yet.
          </p>
        </div>

        {drafts.length === 0 ? (
          <EmptyState
            icon={<SparkleIcon aria-hidden="true" weight="regular" className="size-8" />}
            title="Nothing has been repurposed yet"
            body="Paste a long-form asset above and pick the platforms. One draft per platform appears here, editable, with the asset title on it."
            action={
              <Button asChild variant="secondary" size="md">
                <Link href="/queue">See the whole queue</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {drafts.map((draft) => (
              <Card key={draft.id} className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="neutral">{platformLabel(draft.platform)}</Badge>
                  <Badge tone="neutral">{draft.clientName}</Badge>
                  <span className="numeric text-caption text-faint">
                    {cutStamp.format(draft.createdAt)}
                  </span>
                </div>
                {draft.sourceAssetTitle ? (
                  <p className="text-caption text-faint">Cut from {draft.sourceAssetTitle}</p>
                ) : null}
                <DraftEditor id={draft.id} body={draft.body} />
              </Card>
            ))}
          </div>
        )}
      </section>

      <Steps
        steps={repurposeSteps}
        eyebrow="How it runs"
        title="Four moves from one asset to a signed-off post"
      />

      <Bento items={repurposeBento} title="How a generated draft behaves" />
    </div>
  );
}
