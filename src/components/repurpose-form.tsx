"use client";

import { useActionState, useEffect, useState, type ReactElement } from "react";
import { CheckIcon, SparkleIcon } from "@phosphor-icons/react/dist/ssr";
import { repurposeAsset } from "@/app/(app)/repurpose/actions";
import { AiNotice } from "@/components/ai-notice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FormMessage, Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { PLATFORMS, platformLabel, type Platform } from "@/lib/approvals";
import { initialFormState } from "@/lib/form-state";

/**
 * Paste an asset, pick a client, tick the platforms, get drafts in the queue.
 *
 * Every field is held in state rather than left to the DOM, because React
 * resets an uncontrolled form once its action returns: a failed run would
 * otherwise throw away the thing the user just pasted. Retrying is one press
 * of the same button with the text still in the box.
 */
export type RepurposeFormProps = {
  /** Client accounts this workspace runs, for the selector. */
  clients: readonly string[];
  /** A worked example the user can load instead of finding their own. */
  sample?: { title: string; clientName: string; body: string };
  /** Runs left this month, or null when there is no limit. */
  remaining: number | null;
};

const DEFAULT_PLATFORMS: readonly Platform[] = ["X", "INSTAGRAM", "LINKEDIN"];

export function RepurposeForm({ clients, sample, remaining }: RepurposeFormProps): ReactElement {
  const [state, action, pending] = useActionState(repurposeAsset, initialFormState);

  const [clientName, setClientName] = useState<string>(clients[0] ?? "");
  const [assetTitle, setAssetTitle] = useState("");
  const [assetBody, setAssetBody] = useState("");
  const [platforms, setPlatforms] = useState<readonly Platform[]>(DEFAULT_PLATFORMS);

  /* Clearing the box is a render-time adjustment rather than an effect: the
     asset only leaves the textarea once a run has actually written rows, so a
     failed run keeps every word of it for the retry. */
  const [seen, setSeen] = useState(state);
  if (seen !== state) {
    setSeen(state);
    if (state.status === "ok" || state.status === "degraded") {
      setAssetTitle("");
      setAssetBody("");
    }
  }

  useEffect(() => {
    if (state.status === "ok") {
      toast({ title: "Drafts in the queue", body: state.message, tone: "positive" });
    }
    if (state.status === "degraded") {
      toast({ title: "Drafts in the queue", body: state.message, tone: "neutral" });
    }
  }, [state]);

  function toggle(platform: Platform): void {
    setPlatforms((current) =>
      current.includes(platform)
        ? current.filter((entry) => entry !== platform)
        : [...current, platform],
    );
  }

  function loadSample(): void {
    if (!sample) return;
    setAssetTitle(sample.title);
    setAssetBody(sample.body);
    if (clients.includes(sample.clientName)) setClientName(sample.clientName);
  }

  return (
    <div className="flex flex-col gap-6">
      <form action={action} className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="repurpose-client" label="Client account" hint="The drafts land under this name in the queue.">
            {clients.length > 0 ? (
              <Select
                name="clientName"
                value={clientName}
                onChange={(event) => {
                  setClientName(event.target.value);
                }}
              >
                {clients.map((client) => (
                  <option key={client} value={client}>
                    {client}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                name="clientName"
                value={clientName}
                onChange={(event) => {
                  setClientName(event.target.value);
                }}
                required
                maxLength={80}
                placeholder="Northgate Dental"
              />
            )}
          </Field>

          <Field
            id="repurpose-title"
            label="Source asset title"
            hint="Every draft keeps this line, so the client sees what it was cut from."
          >
            <Input
              name="assetTitle"
              value={assetTitle}
              onChange={(event) => {
                setAssetTitle(event.target.value);
              }}
              required
              maxLength={160}
              placeholder="Five fluoride myths patients still repeat"
            />
          </Field>
        </div>

        <Field
          id="repurpose-body"
          label="Paste the asset"
          hint="A blog post, a newsletter, a transcript. A few hundred words is enough to work from."
        >
          <Textarea
            name="assetBody"
            value={assetBody}
            onChange={(event) => {
              setAssetBody(event.target.value);
            }}
            required
            rows={10}
            minLength={200}
            placeholder="Paste the whole post here."
          />
        </Field>

        <fieldset className="flex flex-col gap-3">
          <legend className="text-small text-ink">Platforms</legend>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((platform) => {
              const on = platforms.includes(platform);
              return (
                /* The input is stretched over the whole pill rather than drawn
                   at its native 16px, so the tap target is the thing you can
                   see. The box beside the label is the painted state. */
                <label
                  key={platform}
                  className="group relative inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border-(length:--stroke) border-line bg-surface px-3 py-2 text-small text-ink transition-colors duration-(--duration-1) ease-out-soft hover:border-line-strong hover:bg-elevated active:scale-[0.99] has-[:checked]:border-accent has-[:checked]:bg-accent-soft"
                >
                  <input
                    type="checkbox"
                    name="platforms"
                    value={platform}
                    checked={on}
                    onChange={() => {
                      toggle(platform);
                    }}
                    className="absolute inset-0 m-0 size-full cursor-pointer appearance-none rounded-md"
                  />
                  <span
                    aria-hidden="true"
                    className="grid size-4 shrink-0 place-items-center rounded-sm border-(length:--stroke) border-line-strong bg-elevated text-on-accent transition-colors duration-(--duration-1) ease-out-soft group-has-[:checked]:border-accent group-has-[:checked]:bg-accent"
                  >
                    <CheckIcon
                      weight="bold"
                      className="size-3 opacity-0 group-has-[:checked]:opacity-100"
                    />
                  </span>
                  {platformLabel(platform)}
                </label>
              );
            })}
          </div>
          <p className="text-caption text-faint">
            One draft per ticked platform, each in its own shape. All of them arrive as drafts, so
            nothing goes to a client until you send it.
          </p>
        </fieldset>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="primary" size="lg" loading={pending}>
            <SparkleIcon aria-hidden="true" weight="regular" className="size-4" />
            Draft {platforms.length} post{platforms.length === 1 ? "" : "s"}
          </Button>
          {sample ? (
            <Button type="button" variant="ghost" size="lg" onClick={loadSample}>
              Load the sample asset
            </Button>
          ) : null}
          {remaining !== null ? (
            <Badge tone="neutral">{remaining} runs left this month</Badge>
          ) : (
            <Badge tone="accent">Unlimited runs</Badge>
          )}
        </div>

        {state.status === "error" ? <FormMessage status="error" message={state.message} /> : null}
        {state.status === "degraded" ? <AiNotice message={state.message} /> : null}
      </form>

      {pending ? (
        <div className="flex flex-col gap-3" aria-live="polite">
          <p className="text-caption text-faint">
            Drafting {platforms.length} post{platforms.length === 1 ? "" : "s"} for {clientName || "this client"}.
          </p>
          {platforms.map((platform) => (
            <Card key={platform} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Badge tone="neutral">{platformLabel(platform)}</Badge>
                <Skeleton className="h-4 w-24" />
              </div>
              <SkeletonText lines={3} />
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
