import type { ReactElement } from "react";
import { clsx } from "clsx";
import { ClockIcon, FileTextIcon } from "@phosphor-icons/react/dist/ssr";
import { QueueRowActions } from "@/components/queue-row-actions";
import { ReviewLink } from "@/components/review-link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  platformLabel,
  reviewPath,
  stateLabel,
  stateTone,
  type ApprovalState,
  type Platform,
} from "@/lib/approvals";

/**
 * The approval queue, rendered in exactly one place.
 *
 * The signed-in page passes database rows and turns the actions on; the landing
 * page's ProductFrame passes the seeded demo rows with the actions off. Same
 * component, same data, so the marketing page cannot lie about the product.
 */

export type ApprovalQueueRow = {
  id: string;
  clientName: string;
  platform: Platform;
  body: string;
  sourceAssetTitle: string | null;
  scheduledFor: Date | null;
  state: ApprovalState;
  reviewToken: string;
  reviewerName: string | null;
  decidedAt: Date | null;
  decisionNote: string | null;
};

export type ApprovalQueueProps = {
  items: readonly ApprovalQueueRow[];
  /** Renders Send for review and Release to schedule, wired to the actions. */
  actions?: boolean;
  /** `compact` trims the row to what fits in the marketing frame. */
  density?: "comfortable" | "compact";
  className?: string;
};

const stamp = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

const slotStamp = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

function excerpt(body: string, limit: number): string {
  const flat = body.replace(/\s+/g, " ").trim();
  return flat.length <= limit ? flat : `${flat.slice(0, limit).trimEnd()}...`;
}

/** Rows in the order a manager reads them: by client, newest first inside one. */
function groupByClient(items: readonly ApprovalQueueRow[]): [string, ApprovalQueueRow[]][] {
  const groups = new Map<string, ApprovalQueueRow[]>();
  for (const item of items) {
    const list = groups.get(item.clientName) ?? [];
    list.push(item);
    groups.set(item.clientName, list);
  }
  return [...groups.entries()];
}

function QueueRow({
  item,
  actions,
  compact,
}: {
  item: ApprovalQueueRow;
  actions: boolean;
  compact: boolean;
}): ReactElement {
  return (
    <Card className={clsx("flex flex-col gap-3", compact && "gap-2 p-4")}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={stateTone(item.state)}>{stateLabel(item.state)}</Badge>
        <Badge tone="neutral">{platformLabel(item.platform)}</Badge>
        {item.scheduledFor ? (
          <span className="numeric inline-flex items-center gap-1.5 text-caption text-faint">
            <ClockIcon aria-hidden="true" weight="regular" className="size-3.5" />
            {slotStamp.format(item.scheduledFor)}
          </span>
        ) : (
          <span className="text-caption text-faint">No slot booked</span>
        )}
      </div>

      <p className={clsx("text-ink", compact ? "text-small" : "text-body")}>
        {excerpt(item.body, compact ? 110 : 320)}
      </p>

      {item.sourceAssetTitle ? (
        <p className="inline-flex items-start gap-1.5 text-caption text-muted">
          <FileTextIcon aria-hidden="true" weight="regular" className="mt-0.5 size-3.5 shrink-0" />
          Cut from {item.sourceAssetTitle}
        </p>
      ) : null}

      {item.decidedAt && item.reviewerName ? (
        <p className="text-caption text-muted">
          {item.state === "REJECTED" ? "Rejected by " : "Approved by "}
          <span className="text-ink">{item.reviewerName}</span>
          {" on "}
          <span className="numeric">{stamp.format(item.decidedAt)}</span>
        </p>
      ) : null}

      {item.decisionNote ? (
        <p className="border-l-(length:--stroke-strong) border-critical/40 pl-3 text-small text-muted">
          {item.decisionNote}
        </p>
      ) : null}

      {compact ? null : (
        <div className="flex flex-wrap items-end justify-between gap-3 border-t-(length:--stroke) border-line pt-3">
          {item.state === "DRAFT" ? (
            <p className="text-caption text-faint">
              The review link opens once this draft is sent for review.
            </p>
          ) : (
            <ReviewLink path={reviewPath(item.reviewToken)} />
          )}
          {actions ? <QueueRowActions id={item.id} state={item.state} /> : null}
        </div>
      )}
    </Card>
  );
}

export function ApprovalQueue({
  items,
  actions = false,
  density = "comfortable",
  className,
}: ApprovalQueueProps): ReactElement {
  const compact = density === "compact";

  return (
    <div className={clsx("flex flex-col", compact ? "gap-4" : "gap-stack", className)}>
      {groupByClient(items).map(([clientName, rows]) => (
        <section key={clientName} className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-(length:--stroke) border-line pb-2">
            <h3 className={compact ? "text-body text-ink" : "text-h3 text-ink"}>{clientName}</h3>
            <p className="numeric text-caption text-faint">
              {rows.filter((row) => row.state === "PENDING").length} pending of {rows.length}
            </p>
          </div>

          <ul className="flex flex-col gap-3">
            {rows.map((row) => (
              <li key={row.id}>
                <QueueRow item={row} actions={actions} compact={compact} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
