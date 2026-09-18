import type { ReactElement } from "react";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

/** The shape of the repurposer, drawn before the drafts arrive. */
export default function RepurposeLoading(): ReactElement {
  return (
    <div className="flex flex-col gap-stack" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading the repurposer</span>

      <div className="flex flex-wrap items-end justify-between gap-4 border-b-(length:--stroke) border-line pb-6">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>

      <div className="flex flex-col gap-5 rounded-lg border-(length:--stroke) border-line bg-surface p-6">
        <Skeleton className="h-5 w-40" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-10 w-full rounded-input" />
          <Skeleton className="h-10 w-full rounded-input" />
        </div>
        <Skeleton className="h-40 w-full rounded-input" />
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((chip) => (
            <Skeleton key={chip} className="h-9 w-24 rounded-input" />
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {[0, 1].map((card) => (
          <div
            key={card}
            className="flex flex-col gap-3 rounded-lg border-(length:--stroke) border-line bg-surface p-6"
          >
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-28" />
            </div>
            <SkeletonText lines={3} />
            <Skeleton className="h-9 w-40 rounded-input" />
          </div>
        ))}
      </div>
    </div>
  );
}
