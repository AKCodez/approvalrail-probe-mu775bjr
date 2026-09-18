import type { ReactElement } from "react";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

/** The shape of the queue, drawn before its rows arrive. */
export default function QueueLoading(): ReactElement {
  return (
    <div className="flex flex-col gap-stack" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading the approval queue</span>

      <div className="flex flex-wrap items-end justify-between gap-4 border-b-(length:--stroke) border-line pb-6">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>

      {[0, 1].map((group) => (
        <div key={group} className="flex flex-col gap-3">
          <Skeleton className="h-5 w-44" />
          {[0, 1].map((row) => (
            <div
              key={row}
              className="flex flex-col gap-3 rounded-lg border-(length:--stroke) border-line bg-surface p-5"
            >
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
              <SkeletonText lines={2} />
              <Skeleton className="h-9 w-48 rounded-input" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
