import { Star } from "lucide-react";

export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  const r = Math.round(rating * 2) / 2;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= r;
        const half = !filled && i - 0.5 === r;
        return (
          <Star
            key={i}
            size={size}
            className={filled || half ? "text-honey" : "text-border2"}
            fill={filled ? "currentColor" : half ? "url(#half)" : "none"}
            strokeWidth={1.5}
          />
        );
      })}
    </div>
  );
}
