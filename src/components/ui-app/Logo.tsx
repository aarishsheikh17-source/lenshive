import { Camera } from "lucide-react";

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="lh-hex flex items-center justify-center bg-honey"
        style={{ width: size, height: size }}
      >
        <Camera size={size * 0.45} strokeWidth={2.5} className="text-white" />
      </div>
      <span className="font-display text-xl text-dark leading-none">LensHive</span>
    </div>
  );
}
