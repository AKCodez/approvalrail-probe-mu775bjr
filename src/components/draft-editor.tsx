"use client";

import { useActionState, useEffect, useState, type ReactElement } from "react";
import { PaperPlaneTiltIcon } from "@phosphor-icons/react/dist/ssr";
import { sendForReview, updateDraftBody } from "@/app/(app)/queue/actions";
import { Button } from "@/components/ui/button";
import { FormMessage, Textarea } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { initialFormState } from "@/lib/form-state";

/**
 * A generated draft, editable in place before it ever reaches a client.
 *
 * The text is held in state so an edit survives a failed save, and Send for
 * review is a second form rather than a second button on the first: sending is
 * a different write with a different audit row behind it.
 */
export type DraftEditorProps = {
  id: string;
  body: string;
};

export function DraftEditor({ id, body }: DraftEditorProps): ReactElement {
  const [saveState, saveAction, saving] = useActionState(updateDraftBody, initialFormState);
  const [sendState, sendAction, sending] = useActionState(sendForReview, initialFormState);
  const [text, setText] = useState(body);

  useEffect(() => {
    if (saveState.status === "ok") {
      toast({ title: "Draft saved", body: saveState.message, tone: "positive" });
    }
  }, [saveState]);

  useEffect(() => {
    if (sendState.status === "ok") {
      toast({ title: "Sent for review", body: sendState.message, tone: "positive" });
    }
  }, [sendState]);

  const dirty = text.trim() !== body.trim();
  const error = saveState.status === "error" ? saveState : sendState.status === "error" ? sendState : null;

  return (
    <div className="flex flex-col gap-3">
      <form action={saveAction} className="flex flex-col gap-3">
        <input type="hidden" name="id" value={id} />
        <Textarea
          name="body"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
          }}
          rows={7}
          aria-label="Draft text"
          className="font-mono text-small"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="outline" size="md" loading={saving} disabled={!dirty}>
            {dirty ? "Save the edit" : "Saved"}
          </Button>
          <p className="text-caption text-faint">
            Edits are yours until you send it. After that the client sees exactly this.
          </p>
        </div>
      </form>

      <form action={sendAction}>
        <input type="hidden" name="id" value={id} />
        <Button type="submit" variant="primary" size="md" loading={sending}>
          <PaperPlaneTiltIcon aria-hidden="true" weight="regular" className="size-4" />
          Send for review
        </Button>
      </form>

      {error ? <FormMessage status="error" message={error.message} /> : null}
    </div>
  );
}
