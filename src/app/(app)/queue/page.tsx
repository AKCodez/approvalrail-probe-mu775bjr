import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TrayIcon } from "@phosphor-icons/react/dist/ssr";
import { ApprovalQueue } from "@/components/approval-queue";
import { PageHeader } from "@/components/page-header";
import { Bento, CtaBand } from "@/components/sections";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { queueBento } from "@/content/marketing";
import { db } from "@/lib/db";
import { features } from "@/lib/env";
import { getCurrentUser } from "@/lib/session";
import { getWorkspace } from "@/lib/workspace";

export const metadata: Metadata = {
  title: "Approval queue",
  description: "Every client post in one queue, with the approval state on each row.",
};

export default async function QueuePage(): Promise<ReactElement> {
  // The (app) layout is the gate; this narrows the type for the query below.
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const workspace = features.db ? await getWorkspace(user.id) : null;

  // Read on the server, render inline. No client-side fetching for first paint.
  const items = workspace
    ? await db.approvalItem.findMany({
        where: { workspaceId: workspace.id },
        orderBy: [{ clientName: "asc" }, { createdAt: "desc" }],
        take: 100,
      })
    : [];

  const pending = items.filter((item) => item.state === "PENDING").length;
  const approved = items.filter((item) => item.state === "APPROVED").length;
  const clients = new Set(items.map((item) => item.clientName)).size;

  return (
    <div className="flex flex-col gap-stack">
      <PageHeader
        title="Approval queue"
        description="Every client post in one place. A row leaves this queue when an approval is on the record, and not before."
        actions={
          <>
            <Badge tone="accent">{pending} pending</Badge>
            <Badge tone="positive">{approved} ready to release</Badge>
            <Button asChild variant="secondary" size="md">
              <Link href="/repurpose">Add drafts</Link>
            </Button>
          </>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<TrayIcon aria-hidden="true" weight="regular" className="size-8" />}
          title="No posts in the queue yet"
          body="Every draft you create lands here, grouped by client, with its approval state on the row. Paste a long-form asset into the repurposer to create your first drafts."
          action={
            <Button asChild variant="primary" size="md">
              <Link href="/repurpose">Paste an asset</Link>
            </Button>
          }
        />
      ) : (
        <>
          <p className="text-small text-muted">
            {items.length} posts across {clients} client accounts. State badges sit on every row, so
            what is blocked is readable without opening anything.
          </p>
          <ApprovalQueue items={items} actions />
        </>
      )}

      <Bento items={queueBento} title="What the states mean" />

      <CtaBand
        title="One asset, a week of drafts."
        body="Paste a blog post and the repurposer writes a draft per platform, straight into this queue."
        primary={{ label: "Open the repurposer", href: "/repurpose" }}
        secondary={{ label: "See the ledger", href: "/dashboard" }}
      />
    </div>
  );
}
