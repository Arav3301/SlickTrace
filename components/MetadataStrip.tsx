import type { Investigation } from "@/lib/types";
import { AIS_LOOKBACK_HOURS } from "@/lib/constants";

interface Fact {
  value: string;
  unit: string;
  label: string;
}

export function MetadataStrip({ investigation }: { investigation: Investigation }) {
  const facts: Fact[] = [
    {
      value: investigation.main_slick.area_km2.toFixed(2),
      unit: "km²",
      label: "Main predicted slick",
    },
    {
      value: String(investigation.candidate_count),
      unit: "",
      label: "Vessels screened",
    },
    {
      value: "15.5",
      unit: "M",
      label: "AIS rows scanned",
    },
    {
      value: `${AIS_LOOKBACK_HOURS}`,
      unit: "h",
      label: "AIS lookback",
    },
  ];

  return (
    <div className="border-t border-line bg-paper" data-metadata-strip>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 px-5 py-4 sm:grid-cols-4">
        {facts.map((f) => (
          <div key={f.label} className="flex min-w-0 flex-col gap-0.5">
            <span className="whitespace-nowrap text-ink-2">
              <span className="tnum text-[22px] font-semibold leading-none text-ink">
                {f.value}
              </span>
              {f.unit ? (
                <span className="ml-1.5 text-[15px] font-medium text-ink-2">{f.unit}</span>
              ) : null}
            </span>
            <span className="mt-1 text-[13px] leading-tight text-sl">{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProvenanceFooter({ investigation }: { investigation: Investigation }) {
  return (
    <footer className="border-t border-line bg-paper-2" data-footer>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-2.5">
        <div className="flex min-w-0 items-baseline gap-x-3">
          <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-faint">
            Sources
          </span>
          <span className="min-w-0 text-[13px] text-ink-2">
            NOAA / MarineCadastre AIS · Sentinel-1A SAR · U-Net
          </span>
        </div>
        <p className="ml-auto min-w-0 text-right text-[13px] text-ink-2">
          {investigation.disclaimer}
        </p>
      </div>
    </footer>
  );
}