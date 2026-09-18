"use client";

import { useState, type ReactElement } from "react";
import { CheckIcon, LinkSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

/**
 * The link a client opens, with one button that copies it.
 *
 * The path is rendered server side so it is readable and crawl-safe without
 * JavaScript; only the copy is a client concern. The absolute URL is built from
 * `window.location.origin` at click time rather than from an env var, so a
 * preview deployment copies its own hostname.
 */
export type ReviewLinkProps = {
  path: string;
  /** Shown instead of the path when the row is not out for review yet. */
  label?: string;
};

export function ReviewLink({ path, label }: ReviewLinkProps): ReactElement {
  const [copied, setCopied] = useState(false);

  function copy(): void {
    const url = `${window.location.origin}${path}`;
    void navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        toast({ title: "Review link copied", body: url, tone: "positive" });
        window.setTimeout(() => {
          setCopied(false);
        }, 2000);
      })
      .catch(() => {
        toast({ title: "Copy failed", body: "Select the link and copy it by hand.", tone: "critical" });
      });
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <code className="numeric min-w-0 truncate rounded-sm border-(length:--stroke) border-line bg-elevated px-2 py-1 text-caption text-muted">
        {label ?? path}
      </code>
      <Button type="button" variant="ghost" size="md" onClick={copy}>
        {copied ? (
          <CheckIcon aria-hidden="true" weight="bold" className="size-4" />
        ) : (
          <LinkSimpleIcon aria-hidden="true" weight="regular" className="size-4" />
        )}
        {copied ? "Copied" : "Copy review link"}
      </Button>
    </div>
  );
}
