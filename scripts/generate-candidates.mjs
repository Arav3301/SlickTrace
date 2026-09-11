import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const csvPath = path.join(root, "public", "data", "candidate_ranking.csv");
const outPath = path.join(root, "public", "data", "candidates.json");

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const header = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    const obj = {};
    header.forEach((h, i) => {
      obj[h] = cells[i] !== undefined ? cells[i] : "";
    });
    return obj;
  });
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const rows = parseCsv(readFileSync(csvPath, "utf8"));

const top = rows
  .map((r) => ({
    candidate_rank: num(r.candidate_rank),
    evidence_rank: num(r.evidence_rank),
    mmsi: r.MMSI,
    imo: r.IMO || null,
    callsign: r.CallSign || null,
    vessel_name: r.VesselName.trim(),
    vessel_type: num(r.VesselType),
    track_intersects_slick: r.track_intersects_slick === "True",
    track_distance_to_slick_km: num(r.track_distance_to_slick_km),
    closest_AIS_distance_km: num(r.closest_AIS_distance_km),
    closest_approach_time: r.closest_approach_time || null,
    hours_before_satellite: num(r.hours_before_satellite),
    speed_at_closest_knots: num(r.speed_at_closest_knots),
    course_at_closest_deg: num(r.course_at_closest_deg),
    points_inside_slick: num(r.points_inside_slick),
    first_inside_time: r.first_inside_time || null,
    last_inside_time: r.last_inside_time || null,
    hours_before_first_inside: r.hours_before_first_inside
      ? num(r.hours_before_first_inside)
      : null,
    hours_before_last_inside: r.hours_before_last_inside
      ? num(r.hours_before_last_inside)
      : null,
    median_speed_knots: num(r.median_speed_knots),
    max_speed_knots: num(r.max_speed_knots),
    ais_points: num(r.ais_points),
    first_seen: r.first_seen || null,
    last_seen: r.last_seen || null,
    observation_hours: num(r.observation_hours),
    alignment_difference_deg: num(r.alignment_difference_deg),
    intersection_score: num(r.intersection_score),
    proximity_score: num(r.proximity_score),
    temporal_score: num(r.temporal_score),
    alignment_score: num(r.alignment_score),
    association_score: num(r.association_score),
    association_label: r.association_label.trim(),
  }))
  .filter((r) => r.candidate_rank !== null && r.candidate_rank <= 5)
  .sort((a, b) => a.candidate_rank - b.candidate_rank);

const payload = {
  source: "candidate_ranking.csv (SlickTrace_Demo_Bundle.zip)",
  generated_from_csv: "candidate_ranking.csv",
  note: "Top 5 candidates by candidate_rank. Scores are full-precision CSV values.",
  candidates: top,
};

writeFileSync(outPath, JSON.stringify(payload, null, 2) + "\n");
console.log("Wrote", outPath, "with", top.length, "candidates");
for (const c of top) {
  console.log(
    `#${c.candidate_rank} ${c.vessel_name} | MMSI ${c.mmsi} | score ${c.association_score} | ${c.association_label}`
  );
}