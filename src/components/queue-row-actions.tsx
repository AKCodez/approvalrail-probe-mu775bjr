"use client";

import { useActionState, useEffect, type ReactElement } from "react";
import { PaperPlaneTiltIcon, CalendarCheckIcon } from "@phosphor-icons/react/dist/ssr";
import { releaseToSchedule, sendForReview } from "@/app/(app)/queue/actions";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { canSendForReview, releaseBlockedReason, type ApprovalState } from "@/lib/approvals";
import { initialFormState, type FormState } from "@/lib/form-state";

/**
 * The two moves an account manager can make on a row.
 *
 * Release stays visible and disabled with the blocking state named, because a
 * hidden action reads as a bug and leaves the manager guessing which client is
 * holding the queue. Both actions check the session and the state again on the
 * server; this is only what the row looks like.
 */
export type QueueRowActionsProps = {
  id: string;
  state: ApprovalState;
};

/** Fires a toast the first time an action comes back ok. */
function useResultToast(state: FormState, title: string): void {
  useEffect(() => {
    if (state.status === "ok") toast({ title, body: state.message, tone: "positive" });
  }, [state, title]);
}

export function QueueRowActions({ id, state }: QueueRowActionsProps): ReactElement {
  const [sendState, sendAction, sending] = useActionState(sendForReview, initialFormState);
  const [releaseState, releaseAction, releasing] = useActionState(
    releaseToSchedule,
    initialFormState,
  );

  useResultToast(sendState, "Sent for review");
  useResultToast(releaseState, "Released");

  const blocked = releaseBlockedReason(state);
  const message = sendState.status === "error" ? sendState : releaseState;

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <div className="flex flex-wrap items-center gap-2">
        {canSendForReview(state) ? (
          <form action={sendAction}>
            <input type="hidden" name="id" value={id} />
            <Button type="submit" variant="secondary" size="md" loading={sending}>
              <PaperPlaneTiltIcon aria-hidden="true" weight="regular" className="size-4" />
              Send for review
            </Button>
          </form>
        ) : null}

        <form action={releaseAction}>
          <input type="hidden" name="id" value={id} />
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={releasing}
            disabled={blocked !== null}
            title={blocked ?? undefined}
          >
            <CalendarCheckIcon aria-hidden="true" weight="regular" className="size-4" />
            Release to schedule
          </Button>
        </form>
      </div>

      {blocked ? (
        <p className="text-caption text-faint sm:text-right">{blocked}</p>
      ) : (
        <p className="text-caption text-muted sm:text-right">
          Approved on the record. Release is open.
        </p>
      )}

      {message.status === "error" ? (
        <FormMessage status="error" message={message.message} className="sm:text-right" />
      ) : null}
    </div>
  );
}
