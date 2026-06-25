import { initials } from "@/lib/utils-app";

export function Avatar({
  name,
  src,
  size = 48,
}: {
  name?: string | null;
  src?: string | null;
  size?: number;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={name ?? ""}
        className="rounded-full object-cover border border-border"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-accent text-dark font-display flex items-center justify-center border border-border"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials(name)}
    </div>
  );
}
