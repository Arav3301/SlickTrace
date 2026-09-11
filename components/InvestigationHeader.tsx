import Link from "next/link";
import type { Investigation } from "@/lib/types";
import { formatUtcTimeOnly, formatDateOnly } from "@/lib/format";
import { ValidatedReplayBadge } from "./ValidatedReplayBadge";

export function InvestigationHeader() {
  return (
    <header className="border-b border-line bg-paper">
      <div className="flex items-center justify-between gap-4 px-5 py-2.5">
        <div className="flex items-baseline gap-3">
          <Link
            href="/"
            className="text-[15px] font-semibold uppercase tracking-[0.14em] text-ink hover:text-marine"
          >
            SlickTrace
          </Link>
          <span className="hidden text-[13px] text-sl sm:block">
            Marine spill investigation
          </span>
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-1 text-[13px] md:flex">
            <span className="border border-ink bg-ink px-3 py-1.5 font-medium text-paper">
              Investigation
            </span>
            <Link
              href="/detection"
              className="px-3 py-1.5 text-ink-2 transition-colors hover:text-ink"
            >
              Detection
            </Link>
          </nav>
          <ValidatedReplayBadge />
        </div>
      </div>
      {/* Mobile: section navigation on its own compact row */}
      <nav
        data-mobile-nav
        aria-label="Sections"
        className="flex items-center gap-2 border-t border-line px-5 py-1.5 text-[13px] md:hidden"
      >
        <span className="border border-ink bg-ink px-3 py-2 font-medium text-paper">
          Investigation
        </span>
        <Link
          href="/detection"
          className="px-2 py-2 text-ink-2 transition-colors hover:text-ink"
        >
          Detection
        </Link>
      </nav>
    </header>
  );
}

export function InvestigationTitleRow({
  investigation,
  children,
}: {
  investigation: Investigation;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b border-line bg-paper">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-2.5">
        <div className="flex min-w-0 items-baseline gap-4">
          <h1 className="truncate text-[19px] font-semibold tracking-tight text-ink">
            {investigation.investigation_id}
          </h1>
          <p className="hidden shrink-0 text-[14px] text-sl md:block">
            {investigation.satellite} · {formatDateOnly(investigation.satellite_time_utc)} · Gulf of Mexico
          </p>
        </div>
        <div className="flex items-center gap-5 font-mono text-[13px] text-ink-2">
          <span>
            <span className="text-faint">ACQ </span>
            {formatUtcTimeOnly(investigation.satellite_time_utc)}
          </span>
          <span className="hidden sm:block">
            <span className="text-faint">THRESHOLD </span>
            {investigation.threshold.toFixed(2)}
          </span>
          <span className="hidden sm:block">
            <span className="text-faint">MODEL </span>
            {investigation.model}
          </span>
          {children}
        </div>
      </div>
    </div>
  );
}