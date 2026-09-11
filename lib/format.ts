import type { AssociationLabel } from "./types";

export function formatScore(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toFixed(2);
}

export function formatScoreShort(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toFixed(1);
}

export function formatKm(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const rounded = Math.round(value * 100) / 100;
  return `${rounded.toFixed(2)} km`;
}

export function formatCompactKm(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  if (value === 0) return "0.0 km";
  return `${value.toFixed(value < 1 ? 2 : 1)} km`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

export function formatHours(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${value.toFixed(2)} h`;
}

export function formatHoursShort(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${value.toFixed(1)} h`;
}

export function formatKnots(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${value.toFixed(1)} kn`;
}

export function formatDegrees(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${value.toFixed(1)}°`;
}

export function formatRank(value: number): string {
  return `#${String(value).padStart(2, "0")}`;
}

export function formatCoordDecimal(lat: number, lon: number): string {
  const latStr = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}`;
  const lonStr = `${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? "E" : "W"}`;
  return `${latStr} · ${lonStr}`;
}

/** 2018-09-26T00:01:45.547Z -> "00:01 UTC · 26 SEP 2018" */
export function formatUtcTimestamp(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const time = d
    .toISOString()
    .slice(11, 16)
    .replace(":", ":");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = d
    .toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })
    .toUpperCase();
  const year = d.getUTCFullYear();
  return `${time} UTC · ${day} ${month} ${year}`;
}

export function formatUtcTimeOnly(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.toISOString().slice(11, 16)} UTC`;
}

export function formatDateOnly(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = d
    .toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })
    .toUpperCase();
  const year = d.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

export function associationTone(
  label: string | null | undefined,
): "green" | "amber" | "neutral" {
  if (label === "Strong association") return "green";
  if (label === "Moderate association") return "amber";
  return "neutral";
}

export function normalizeAssociationLabel(label: string): AssociationLabel {
  if (label.startsWith("Strong")) return "Strong association";
  if (label.startsWith("Moderate")) return "Moderate association";
  return "Possible association";
}