import logoIcon from "@/assets/logo-icon.png";

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <img
        src={logoIcon}
        alt="LensHive"
        width={size}
        height={size}
        className="shrink-0"
        style={{ width: size, height: size }}
      />
      <span className="font-display text-xl text-dark leading-none">LensHive</span>
    </div>
  );
}
