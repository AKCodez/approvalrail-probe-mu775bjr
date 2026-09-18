import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ScrollIcon } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/page-header";
import { Bento, CtaBand, Stats } from "@/components/sections";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { queueBento } from "@/content/marketing";
import { median, platformLabel, stateLabel, stateTone, turnaroundHours } from "@/lib/approvals";
import { db } from "@/lib/db";
import { features } from "@/lib/env";
import { getCurrentUser } from "@/lib/session";
import { getWorkspace } from "@/lib/workspace";

export const metadata: Metadata = { title: "Dashboard" };

const stamp = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

const ACTION_LABELS: Record<string, string> = {
  CREATED: "Created",
  SENT_FOR_REVIEW: "Sent for review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  RELEASED: "Released",
  EDITED: "Edited",
};

export default async function DashboardPage(): Promise<ReactElement> {
  // The (app) layout is the gate; this narrows the type for the queries below.
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const workspace = features.db ? await getWorkspace(user.id) : null;

  // Read on the server, render inline. No client-side fetching for first paint.
  const items = workspace
    ? await db.approvalItem.findMany({
        where: { workspaceId: workspace.id },
        orderBy: { createdAt: "desc" },
        take: 200,
      })
    : [];

  const events = workspace
    ? await db.auditEvent.findMany({
        where: { item: { workspaceId: workspace.id }, action: { in: ["APPROVED", "REJECTED", "RELEASED"] } },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { item: { select: { clientName: true, platform: true, state: true } } },
      })
    : [];

  const pending = items.filter((item) => item.state === "PENDING").length;
  const decided = items.filter((item) => item.decidedAt !== null);
  const rejected = decided.filter((item) => item.state === "REJECTED").length;
  const turnaround = median(
    decided.flatMap((item) => (item.decidedAt ? [turnaroundHours(item.createdAt, item.decidedAt)] : [])),
  );

  const stats = [
    { value: pending, label: "Pending approvals" },
    { value: turnaround === null ? 0 : Math.round(turnaround), label: "Median turnaround", suffix: "h" },
    { value: decided.length, label: "Decisions on the record" },
    { value: rejected, label: "Rejections to rework" },
  ];

  return (
    <div className="flex flex-col gap-stack">
      <PageHeader
        title={workspace ? workspace.name : "Your workspace"}
        description={`What the queue produced. Signed in as ${user.email}.`}
        actions={
          <>
            <Badge tone="accent">{pending} pending</Badge>
            <Button asChild variant="secondary" size="md">
              <Link href="/queue">Open the queue</Link>
            </Button>
          </>
        }
      />

      <Stats stats={stats} />

      <Card>
        <CardHeader>
          <CardTitle>Recent decisions ledger</CardTitle>
          <CardDescription>
            The ledger, newest first. Each row is who moved a post, when, and what they said.
          </CardDescription>
        </CardHeader>

        {events.length === 0 ? (
          <EmptyState
            icon={<ScrollIcon aria-hidden="true" weight="regular" className="size-8" />}
            title="No decisions yet"
            body="Every approval, rejection and release lands here with a reviewer name and a timestamp. Send a draft for review to start the ledger."
            action={
              <Button asChild variant="primary" size="md">
                <Link href="/queue">Open the queue</Link>
              </Button>
            }
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Client</TH>
                <TH>Decision</TH>
                <TH>Who</TH>
                <TH align="right">When</TH>
              </TR>
            </THead>
            <TBody>
              {events.map((event) => (
                <TR key={event.id}>
                  <TD>
                    <span className="block text-ink">{event.item.clientName}</span>
                    <span className="block text-caption text-faint">
                      {platformLabel(event.item.platform)}
                    </span>
                  </TD>
                  <TD>
                    <Badge tone={stateTone(event.item.state)}>
                      {ACTION_LABELS[event.action] ?? stateLabel(event.item.state)}
                    </Badge>
                    {event.note ? (
                      <span className="mt-1 block max-w-prose text-caption text-muted">
                        {event.note}
                      </span>
                    ) : null}
                  </TD>
                  <TD>{event.actor}</TD>
                  <TD align="right" className="whitespace-nowrap">
                    {stamp.format(event.createdAt)}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <Bento items={queueBento} title="What the states mean" />

      <CtaBand
        title="The next draft starts from an asset you already wrote."
        body="Paste it, pick the platforms, and the drafts land in the queue."
        primary={{ label: "Open the repurposer", href: "/repurpose" }}
        secondary={{ label: "See the queue", href: "/queue" }}
      />
    </div>
  );
}
