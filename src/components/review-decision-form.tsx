"use client";

import { useActionState, useEffect, useState, type ReactElement } from "react";
import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { approveItem, rejectItem } from "@/app/(marketing)/review/actions";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input, Textarea } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { initialFormState } from "@/lib/form-state";

/**
 * Approve, or reject with a note. One form, two submit buttons, one shared
 * reviewer name, because the name is what the whole record hangs on.
 *
 * Reject reveals the note field first and only then submits: the note is
 * required on the server too, so this is a courtesy rather than the rule.
 */
export type ReviewDecisionFormProps = {
  token: string;
};

export function ReviewDecisionForm({ token }: ReviewDecisionFormProps): ReactElement {
  const [approveState, approveAction, approving] = useActionState(approveItem, initialFormState);
  const [rejectState, rejectAction, rejecting] = useActionState(rejectItem, initialFormState);
  const [rejectOpen, setRejectingOpen] = useState(false);

  useEffect(() => {
    if (approveState.status === "ok") {
      toast({ title: "Approved", body: approveState.message, tone: "positive" });
    }
  }, [approveState]);

  useEffect(() => {
    if (rejectState.status === "ok") {
      toast({ title: "Rejected", body: rejectState.message, tone: "neutral" });
    }
  }, [rejectState]);

  const error =
    approveState.status === "error"
      ? approveState
      : rejectState.status === "error"
        ? rejectState
        : null;

  return (
    <div className="flex flex-col gap-5">
      <form action={rejectOpen ? rejectAction : approveAction} className="flex flex-col gap-4">
        <input type="hidden" name="token" value={token} />

        <Field
          id="review-name"
          label="Your name"
          hint="Reviewer name on the record, with the time of your decision. It is what the agency will point at later."
        >
          <Input
            name="reviewerName"
            required
            maxLength={80}
            autoComplete="name"
            placeholder="Who is signing this off?"
          />
        </Field>

        {rejectOpen ? (
          <Field
            id="review-note"
            label="What needs to change"
            hint="Required. The note lands on the queue row word for word."
          >
            <Textarea
              name="note"
              required
              minLength={4}
              rows={3}
              placeholder="Shorten the intro, swap the second line, hold until Monday."
            />
          </Field>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          {rejectOpen ? (
            <>
              <Button type="submit" variant="danger" size="lg" loading={rejecting}>
                <XCircleIcon aria-hidden="true" weight="regular" className="size-4" />
                Send the rejection
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => {
                  setRejectingOpen(false);
                }}
              >
                Back to approve
              </Button>
            </>
          ) : (
            <>
              <Button type="submit" variant="primary" size="lg" loading={approving}>
                <CheckCircleIcon aria-hidden="true" weight="regular" className="size-4" />
                Approve
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => {
                  setRejectingOpen(true);
                }}
              >
                Reject with a note
              </Button>
            </>
          )}
        </div>

        {error ? <FormMessage status="error" message={error.message} /> : null}
      </form>

      <p className="text-caption text-faint">
        Approving puts your name and the current time on this post. Nothing publishes before that,
        and the record cannot be edited afterwards.
      </p>
    </div>
  );
}
