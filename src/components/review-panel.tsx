import type { ReactElement } from "react";
import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { ReviewDecisionForm } from "@/components/review-decision-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  platformLabel,
  platformShape,
  stateLabel,
  stateTone,
  type ApprovalState,
  type Platform,
} from "@/lib/approvals";

/**
 * One post, as the client sees it.
 *
 * The post is rendered in its platform shape, with the client account, the
 * platform and the booked slot above it, so a reviewer is deciding on the thing
 * itself rather than on a row in someone else's tool. A post that already has a
 * decision shows the decision, the name and the timestamp instead of the
 * buttons: the first decision is the record.
 */
export type ReviewPanelItem = {
  reviewToken: string;
  clientName: string;
  platform: Platform;
  body: string;
  sourceAssetTitle: string | null;
  scheduledFor: Date | null;
  state: ApprovalState;
  reviewerName: string | null;
  decidedAt: Date | null;
  decisionNote: string | null;
};

export type ReviewPanelProps = {
  item: ReviewPanelItem;
  /** False on a preview with no database, where a decision cannot be recorded. */
  canDecide?: boolean;
};

const slotStamp = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

const decidedStamp = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

export function ReviewPanel({ item, canDecide = true }: ReviewPanelProps): ReactElement {
  const decided = item.decidedAt !== null && item.reviewerName !== null;
  const rejected = item.state === "REJECTED";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 border-b-(length:--stroke) border-line pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={stateTone(item.state)}>{stateLabel(item.state)}</Badge>
          <Badge tone="neutral">{platformLabel(item.platform)}</Badge>
        </div>
        <h2 className="text-h2 text-ink">{item.clientName}</h2>
        <p className="text-small text-muted">
          {platformShape(item.platform)}
          {item.scheduledFor ? ` - booked for ${slotStamp.format(item.scheduledFor)}` : " - no slot booked yet"}
        </p>
        {item.sourceAssetTitle ? (
          <p className="text-caption text-faint">Cut from {item.sourceAssetTitle}</p>
        ) : null}
      </div>

      <Card className="bg-elevated">
        <p className="text-caption text-faint">As it will appear on {platformLabel(item.platform)}</p>
        <div className="mt-3 flex flex-col gap-3">
          {item.body.split("\n").map((line, index) =>
            line.trim().length === 0 ? null : (
              <p key={`${index}-${line.slice(0, 12)}`} className="text-body text-ink">
                {line}
              </p>
            ),
          )}
        </div>
      </Card>

      {decided && item.decidedAt && item.reviewerName ? (
        <Card tone={rejected ? "critical" : "accent"} className="flex flex-col gap-3">
          <p className="inline-flex items-center gap-2 text-h3 text-ink">
            {rejected ? (
              <XCircleIcon aria-hidden="true" weight="regular" className="size-5 text-critical" />
            ) : (
              <CheckCircleIcon aria-hidden="true" weight="regular" className="size-5 text-accent" />
            )}
            {rejected ? "Rejected" : "Approved"} by {item.reviewerName}
          </p>
          <p className="numeric text-small text-muted">
            On the record at {decidedStamp.format(item.decidedAt)}
          </p>
          {item.decisionNote ? (
            <p className="border-l-(length:--stroke-strong) border-critical/40 pl-3 text-body text-ink">
              {item.decisionNote}
            </p>
          ) : null}
          <p className="text-caption text-faint">
            This decision cannot be edited. The agency sees the same row you do.
          </p>
        </Card>
      ) : canDecide ? (
        <ReviewDecisionForm token={item.reviewToken} />
      ) : (
        <Card className="flex flex-col gap-2">
          <p className="text-h3 text-ink">Decisions are off on this preview</p>
          <p className="text-small text-muted">
            This page has no database behind it, so approving would record nothing. On a live
            workspace the buttons sit here, and a decision writes your name and the time.
          </p>
        </Card>
      )}
    </div>
  );
}
