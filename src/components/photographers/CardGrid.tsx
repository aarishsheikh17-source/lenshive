import type { PhotographerListItem } from "@/lib/photographers";
import { PhotographerCard } from "./PhotographerCard";

export function CardGrid({ items }: { items: PhotographerListItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {items.map((p) => (
        <PhotographerCard key={p.id} p={p} />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="aspect-[4/3] shimmer" />
      <div className="p-4 space-y-3">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 rounded-full shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 shimmer rounded" />
            <div className="h-2.5 w-20 shimmer rounded" />
          </div>
        </div>
        <div className="h-2.5 w-full shimmer rounded" />
        <div className="h-2.5 w-2/3 shimmer rounded" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
