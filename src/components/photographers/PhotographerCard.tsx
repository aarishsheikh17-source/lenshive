import { Link } from "@tanstack/react-router";
import { MapPin, BadgeCheck } from "lucide-react";
import type { PhotographerListItem } from "@/lib/photographers";
import { Avatar } from "@/components/ui-app/Avatar";
import { Stars } from "@/components/ui-app/Stars";
import { formatPrice } from "@/lib/utils-app";

export function PhotographerCard({ p }: { p: PhotographerListItem }) {
  return (
    <Link
      to="/photographers/$id"
      params={{ id: p.id }}
      className="group block bg-surface border border-border rounded-xl overflow-hidden shadow-card transition hover:-translate-y-0.5 hover:shadow-pop"
    >
      <div className="relative aspect-[4/3] bg-accent overflow-hidden">
        {p.cover_url ? (
          <img
            src={p.cover_url}
            alt={`${p.profile?.full_name ?? "Photographer"} portfolio cover`}
            loading="lazy"
            className="w-full h-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full shimmer" />
        )}
        {p.is_available && (
          <span className="absolute top-3 left-3 bg-surface/95 backdrop-blur text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 text-ink">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            Available
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Avatar name={p.profile?.full_name} src={p.profile?.avatar_url} size={40} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-display text-lg text-dark truncate">
                {p.profile?.full_name ?? "Photographer"}
              </h3>
              {p.profile?.is_verified && (
                <BadgeCheck size={16} className="text-honey shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPin size={12} />
              <span className="truncate">
                {p.city}
                {p.country && p.country !== "India" ? `, ${p.country}` : ""}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {p.specializations.slice(0, 3).map((s) => (
            <span
              key={s}
              className="text-[11px] uppercase tracking-wide font-medium text-muted-ink bg-accent px-2 py-0.5 rounded-full"
            >
              {s}
            </span>
          ))}
        </div>
        <div className="flex items-end justify-between mt-4 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5">
            <Stars rating={p.rating} />
            <span className="text-xs text-muted-foreground">
              {p.rating.toFixed(1)} ({p.total_reviews})
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-dark">
              {formatPrice(p.pricing?.hourly_rate, p.pricing?.currency ?? "₹")}
              <span className="text-xs text-muted-foreground font-normal">/hr</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
