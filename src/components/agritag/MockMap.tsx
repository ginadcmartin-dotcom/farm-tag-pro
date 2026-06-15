import { cn } from "@/lib/utils";

type Parcel = {
  id: string;
  d: string; // svg path
  status: "untagged" | "partial" | "full";
};

const STATUS_FILL: Record<Parcel["status"], string> = {
  untagged: "fill-slate-300/60 stroke-slate-400",
  partial: "fill-amber-300/50 stroke-amber-500",
  full: "fill-emerald-400/50 stroke-emerald-600",
};

export function MockMap({
  parcels,
  area,
  className,
  highlightId,
  selectedIds,
  onParcelClick,
}: {
  parcels: Parcel[];
  area?: string;
  className?: string;
  highlightId?: string;
  selectedIds?: string[];
  onParcelClick?: (id: string) => void;
}) {
  const selected = new Set(selectedIds ?? []);
  return (
    <div className={cn("relative overflow-hidden bg-[#e8ecef]", className)}>
      {/* faux satellite tiles */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "linear-gradient(135deg, #cfd8d3 0%, #b9c6bd 25%, #c8d2c7 50%, #aab6ab 75%, #c5d0c4 100%)",
        }}
      />
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full opacity-30"
        viewBox="0 0 400 400"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#5a6b5e" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect width="400" height="400" fill="url(#grid)" />
        <path d="M0 280 Q 200 240 400 300" stroke="#8a9590" strokeWidth="3" fill="none" opacity="0.6" />
        <path d="M120 0 L 140 400" stroke="#8a9590" strokeWidth="2" fill="none" opacity="0.5" />
      </svg>

      <svg
        className="relative h-full w-full"
        viewBox="0 0 400 400"
        preserveAspectRatio="none"
      >
        {area && (
          <path
            d={area}
            fill="oklch(0.52 0.13 148 / 0.08)"
            stroke="oklch(0.52 0.13 148)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
        )}
        {parcels.map((p) => {
          const isSel = selected.has(p.id);
          const isHi = highlightId === p.id;
          return (
            <path
              key={p.id}
              d={p.d}
              strokeWidth={isSel ? 2.5 : isHi ? 2 : 1}
              className={cn(
                STATUS_FILL[p.status],
                "transition-all",
                onParcelClick && "cursor-pointer hover:brightness-95",
                isHi && !isSel && "stroke-primary fill-primary/30",
                isSel && "stroke-primary fill-primary/40",
              )}
              onClick={() => onParcelClick?.(p.id)}
            />
          );
        })}
      </svg>
    </div>
  );
}

// Sample parcel data — irregular polygons resembling cadastral lots
export const SAMPLE_PARCELS: Parcel[] = [
  { id: "PH-IVA-0918", d: "M 40 60 L 110 50 L 120 110 L 50 120 Z", status: "full" },
  { id: "PH-IVA-0919", d: "M 110 50 L 180 55 L 185 115 L 120 110 Z", status: "full" },
  { id: "PH-IVA-0920", d: "M 180 55 L 250 60 L 255 120 L 185 115 Z", status: "partial" },
  { id: "PH-IVA-0921", d: "M 250 60 L 320 70 L 320 130 L 255 120 Z", status: "untagged" },
  { id: "PH-IVA-0922", d: "M 50 120 L 120 110 L 130 180 L 60 190 Z", status: "partial" },
  { id: "PH-IVA-0923", d: "M 120 110 L 185 115 L 195 185 L 130 180 Z", status: "full" },
  { id: "PH-IVA-0924", d: "M 185 115 L 255 120 L 260 190 L 195 185 Z", status: "untagged" },
  { id: "PH-IVA-0925", d: "M 255 120 L 320 130 L 325 195 L 260 190 Z", status: "untagged" },
  { id: "PH-IVA-0926", d: "M 60 190 L 130 180 L 140 250 L 70 260 Z", status: "full" },
  { id: "PH-IVA-0927", d: "M 130 180 L 195 185 L 205 255 L 140 250 Z", status: "partial" },
  { id: "PH-IVA-0928", d: "M 195 185 L 260 190 L 265 260 L 205 255 Z", status: "untagged" },
  { id: "PH-IVA-0929", d: "M 260 190 L 325 195 L 330 265 L 265 260 Z", status: "untagged" },
  { id: "PH-IVA-0930", d: "M 70 260 L 140 250 L 150 320 L 80 330 Z", status: "untagged" },
  { id: "PH-IVA-0931", d: "M 140 250 L 205 255 L 215 325 L 150 320 Z", status: "untagged" },
];

export const SAMPLE_AREA = "M 30 50 L 330 55 L 335 340 L 35 335 Z";
