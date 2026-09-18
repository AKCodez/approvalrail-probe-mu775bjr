import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import brand from "@/brand";
import { PageHeader } from "@/components/page-header";
import { SignOutButton } from "@/components/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input } from "@/components/ui/input";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { tokens } from "@/design/tokens";
import { db } from "@/lib/db";
import { features } from "@/lib/env";
import { getCurrentUser } from "@/lib/session";
import { getUsage } from "@/lib/usage";
import { getWorkspace } from "@/lib/workspace";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage(): Promise<ReactElement> {
  // The (app) layout is the gate; this narrows the type.
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  /* `tokens.brand` is typed `Brand`; the default import is the literal this
     build happens to use, so comparing it fails tsc for every other brand. */
  const scheme = tokens.brand.scheme === "dark" ? "Dark" : "Light";

  const workspace = features.db ? await getWorkspace(user.id) : null;
  const clients = workspace?.clients ?? [];

  const [queued, pending] = workspace
    ? await Promise.all([
        db.approvalItem.count({ where: { workspaceId: workspace.id } }),
        db.approvalItem.count({ where: { workspaceId: workspace.id, state: "PENDING" } }),
      ])
    : [0, 0];

  const usage = workspace
    ? await getUsage(user.id, workspace.id)
    : { used: 0, limit: 6, remaining: 6, gated: false, premium: false, period: "" };

  return (
    <div className="flex flex-col gap-stack">
      <PageHeader
        title="Settings"
        description="Your account, and what this product looks like. Both are short on purpose."
      />

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            This is what we know about you. Editing is not wired up yet, so both fields are
            read only.
          </CardDescription>
        </CardHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="settings-name" label="Name" hint="From the account you signed up with.">
            <Input defaultValue={user.name ?? ""} readOnly disabled autoComplete="name" />
          </Field>
          <Field id="settings-email" label="Email" hint="Sign-in address and where email goes.">
            <Input defaultValue={user.email} readOnly disabled autoComplete="email" />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>
            {workspace
              ? `${workspace.name} - the queue, the review links and the ledger all hang off it.`
              : "Your workspace is created the first time you draft or send a post."}
          </CardDescription>
        </CardHeader>

        {clients.length === 0 ? (
          <EmptyState
            title="No client accounts yet"
            body="A client account appears here the first time you draft posts for it in the repurposer. The name on a draft is the name the client sees on their review link."
            action={
              <Button asChild variant="primary" size="md">
                <Link href="/repurpose">Paste an asset</Link>
              </Button>
            }
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {clients.map((client) => (
              <Badge key={client} tone="neutral">
                {client}
              </Badge>
            ))}
          </div>
        )}

        <Table className="mt-6">
          <THead>
            <TR>
              <TH>This month</TH>
              <TH>Count</TH>
            </TR>
          </THead>
          <TBody>
            <TR>
              <TH scope="row">Posts in the queue</TH>
              <TD className="numeric">{queued}</TD>
            </TR>
            <TR>
              <TH scope="row">Waiting on a client</TH>
              <TD className="numeric">{pending}</TD>
            </TR>
            <TR>
              <TH scope="row">Repurposer runs used</TH>
              <TD className="numeric">
                {usage.limit === null ? `${usage.used}, no limit` : `${usage.used} of ${usage.limit}`}
              </TD>
            </TR>
          </TBody>
        </Table>

        <p className="mt-4 text-caption text-faint">
          {usage.premium
            ? "The Agency plan is active, so drafting is not metered."
            : "The free workspace gets six drafting runs a calendar month. Reading, reviewing and releasing are never metered."}
        </p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            {tokens.direction.signature} The brand decides this, so there is nothing to switch.
          </CardDescription>
        </CardHeader>

        <Table>
          <THead>
            <TR>
              <TH>Setting</TH>
              <TH>Value</TH>
            </TR>
          </THead>
          <TBody>
            <TR>
              <TH scope="row">Direction</TH>
              <TD>{tokens.direction.label}</TD>
            </TR>
            <TR>
              <TH scope="row">Scheme</TH>
              <TD>{scheme}</TD>
            </TR>
            <TR>
              <TH scope="row">Accent</TH>
              <TD>
                <span className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="inline-block size-4 shrink-0 rounded-sm border-(length:--stroke) border-line bg-accent"
                  />
                  <span className="numeric text-small text-muted">
                    {tokens.active.hex.accent}
                  </span>
                </span>
              </TD>
            </TR>
          </TBody>
        </Table>
      </Card>

      <Card tone="critical">
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>
            Signing out ends this session on this device. Deleting an account is not built
            yet: the button is here so nobody has to guess whether it exists.
          </CardDescription>
        </CardHeader>

        <div className="flex flex-wrap items-center gap-3">
          <SignOutButton />
          <Button variant="danger" size="md" disabled>
            Delete account
          </Button>
        </div>
        <p className="mt-3 text-caption text-muted">
          Account deletion is not wired up. To have your data removed, email us and we will
          do it by hand.
        </p>
      </Card>
    </div>
  );
}
