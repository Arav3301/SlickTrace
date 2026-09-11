"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SlickCollection } from "@/lib/types";
import { SlickMap } from "@/components/SlickMap";
import { SlickFigure } from "@/components/SlickFigure";

/* ------------------------------------------------------------------ */
/*  Real pipeline data — no invented values                           */
/* ------------------------------------------------------------------ */

const SCENE = {
  satellite: "Sentinel-1A",
  date: "26 September 2018",
  dateShort: "26 Sep 2018",
  sceneId: "2018_09_26",
  dimensions: "5083 \u00d7 2555",
  resolution: "10 m",
  crs: "EPSG:32616",
  polarization: "VV",
};

const MODEL = {
  name: "U-Net",
  parameters: "7,762,465",
  patchSize: "256 \u00d7 256",
  trainingPatches: "1,566",
  validationPatches: "1,106",
  testPatches: "2,869",
  testScenes: "7",
};

const DETECTION = {
  threshold: 0.55,
  pixelsAtThreshold: 472495,
  totalOilArea: 47.377,
  retainedRegions: 48,
  retainedArea: 47.195,
  mainSlickArea: 34.103,
  centroidLat: 28.905266,
  centroidLon: -89.022854,
};

const METRICS = {
  heldOut: {
    dice: 0.5277,
    iou: 0.3584,
    precision: 0.4214,
    recall: 0.7055,
    specificity: 0.9649,
  },
  thisScene: {
    dice: 0.687,
    iou: 0.523,
    precision: 0.654,
    recall: 0.723,
    specificity: 0.986,
  },
};

const METRIC_EXPLANATIONS: Record<string, string> = {
  Dice: "Overlap between predicted and labelled slick regions.",
  IoU: "How much the predicted area overlaps with the labelled area.",
  Precision: "How often predicted oil pixels were actually labelled as oil.",
  Recall: "How much labelled oil area the model successfully detected.",
  Specificity: "How many non-oil pixels the model correctly identified as background.",
};

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function DetectionPage() {
  const [slick, setSlick] = useState<SlickCollection | null>(null);

  useEffect(() => {
    fetch("/data/slick_polygons.geojson")
      .then((r) => r.json())
      .then((d) => setSlick(d as SlickCollection))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      {/* ============================================================ */}
      {/*  Header                                                      */}
      {/* ============================================================ */}

      <header className="border-b border-line bg-paper">
        <div className="flex items-center justify-between px-6 py-3">
          <Link
            href="/"
            className="text-[15px] font-semibold uppercase tracking-[0.14em] text-ink hover:text-marine"
          >
            SlickTrace
          </Link>
          <nav className="flex items-center gap-1 text-[13px]">
            <Link
              href="/"
              className="px-3 py-1.5 text-ink-2 transition-colors hover:text-ink"
            >
              Investigation
            </Link>
            <span className="border border-ink bg-ink px-3 py-1.5 font-medium text-paper">
              Detection
            </span>
          </nav>
        </div>
      </header>

      {/* ============================================================ */}
      {/*  Title                                                       */}
      {/* ============================================================ */}

      <div className="border-b border-line px-6 py-5">
        <h1 className="text-[26px] font-semibold tracking-tight text-ink">
          Detection Analysis
        </h1>
        <p className="mt-1.5 text-[15px] text-sl">
          How SlickTrace identified the predicted oil slick from satellite imagery
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-ink-2">
          <span>
            <span className="text-faint">SATELLITE </span>
            {SCENE.satellite}
          </span>
          <span>
            <span className="text-faint">DATE </span>
            {SCENE.date}
          </span>
          <span>
            <span className="text-faint">MODEL </span>
            {MODEL.name}
          </span>
          <span>
            <span className="text-faint">THRESHOLD </span>
            {DETECTION.threshold}
          </span>
        </div>
      </div>

      <main className="mx-auto max-w-[960px] px-6 py-10">

        {/* ============================================================ */}
        {/*  PIPELINE — Editorial visual story                           */}
        {/* ============================================================ */}

        <h2 className="mb-8 text-[12px] font-semibold uppercase tracking-[0.12em] text-faint">
          Processing Pipeline
        </h2>

        <div className="mb-16 space-y-0">
          {/* Stage 1 */}
          <div className="stage-block border-b border-line pb-8">
            <div className="mb-4 flex items-baseline gap-4">
              <span className="font-mono text-[28px] font-semibold leading-none text-line-strong">
                01
              </span>
              <h3 className="text-[20px] font-semibold tracking-tight text-ink">
                Sentinel-1 SAR Input
              </h3>
            </div>

            <div className="ml-[52px]">
              {/* Real SAR preview — Sigma0 VV dB from Zenodo 4672426 */}
              <div className="border border-line overflow-hidden">
                  <Image
                    src="/data/detection/2018_09_26_sar_preview.png"
                    alt="Sentinel-1A SAR VV scene 2018_09_26, Gulf of Mexico"
                    width={1500}
                    height={754}
                    unoptimized
                    className="block h-auto w-full object-contain"
                  />
                </div>

              {/* Metadata strip */}
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-ink-2">
                <span>
                  <span className="text-faint">SATELLITE </span>
                  {SCENE.satellite}
                </span>
                <span>
                  <span className="text-faint">POLARIZATION </span>
                  {SCENE.polarization}
                </span>
                <span>
                  <span className="text-faint">DATE </span>
                  {SCENE.dateShort}
                </span>
                <span>
                  <span className="text-faint">DIMENSIONS </span>
                  {SCENE.dimensions} px
                </span>
                <span>
                  <span className="text-faint">RESOLUTION </span>
                  {SCENE.resolution}
                </span>
                <span>
                  <span className="text-faint">CRS </span>
                  {SCENE.crs}
                </span>
              </div>

              <p className="mt-2.5 text-[13px] text-faint">
                Display contrast adjusted for visualization; source data preserved.
              </p>
            </div>
          </div>

          {/* Stage 2 */}
          <div className="stage-block border-b border-line py-8">
            <div className="mb-4 flex items-baseline gap-4">
              <span className="font-mono text-[28px] font-semibold leading-none text-line-strong">
                02
              </span>
              <h3 className="text-[20px] font-semibold tracking-tight text-ink">
                U-Net Segmentation
              </h3>
            </div>

            <div className="ml-[52px]">
              <p className="mb-5 max-w-[640px] text-[16px] leading-relaxed text-ink-2">
                <span className="font-semibold text-ink">Pixel-by-pixel slick segmentation.</span>{" "}
                U-Net predicts how likely each pixel is to belong to an oil-slick
                region. The model was trained on {MODEL.trainingPatches} balanced
                patches and validated on {MODEL.validationPatches} patches from
                separate satellite scenes.
              </p>
              <div className="flex flex-wrap gap-x-8 gap-y-2 text-[14px]">
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-faint">
                    Parameters
                  </span>
                  <span className="ml-2 font-mono font-semibold text-ink">{MODEL.parameters}</span>
                </div>
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-faint">
                    Patch size
                  </span>
                  <span className="ml-2 font-mono font-semibold text-ink">{MODEL.patchSize}</span>
                </div>
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-faint">
                    Input
                  </span>
                  <span className="ml-2 font-semibold text-ink">Single-channel SAR VV</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stage 3 */}
          <div className="stage-block border-b border-line py-8">
            <div className="mb-4 flex items-baseline gap-4">
              <span className="font-mono text-[28px] font-semibold leading-none text-line-strong">
                03
              </span>
              <h3 className="text-[20px] font-semibold tracking-tight text-ink">
                Real Probability Output &amp; Threshold
              </h3>
            </div>

            <div className="ml-[52px]">
              <p className="mb-5 max-w-[640px] text-[16px] leading-relaxed text-ink-2">
                The model does not simply flag slick or no-slick. U-Net scores
                every SAR pixel between 0 and 1. Thresholding that real score is
                what turns the probability output into a binary mask.
              </p>

              <div className="mb-5 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-line pb-4">
                <span className="text-[13.5px] font-semibold text-ink">
                  Focused view of detected region
                </span>
                <span className="text-[12.5px] text-faint">
                  Derived from the full 5083 {"\u00d7"} 2555 scene
                </span>
              </div>

              {/* REAL probability → 0.55 threshold → REAL binary mask */}
              <div className="grid grid-cols-1 items-stretch gap-y-6 md:grid-cols-[1fr_24px_auto_24px_1fr] md:items-center md:gap-x-4">
                {/* Probability output */}
                <figure className="w-full">
                  <div className="border border-line bg-[#17191e] p-2">
                    <Image
                      src="/data/detection/2018_09_26_probability_roi.png"
                      alt="Focused view of the predicted slick probability map for scene 2018_09_26 — dark is low score, warm and bright is high score"
                      width={1500}
                      height={1549}
                      unoptimized
                      loading="lazy"
                      className="block h-auto w-full"
                    />
                  </div>
                  <figcaption className="mt-3">
                    <div className="text-[13px] font-semibold text-ink">
                      Probability output
                    </div>
                    <p className="mt-0.5 text-[13.5px] leading-snug text-ink-2">
                      U-Net assigns every SAR pixel a slick score between 0 and 1.
                    </p>
                    <div className="mt-3">
                      <div className="relative h-2 w-full">
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(90deg,#1a1c22 0%,#2e2a20 25%,#4e3c22 45%,#8a5a1e 55%,#b27a2e 70%,#d99a45 85%,#f2e3c0 100%)",
                          }}
                        />
                        <div className="absolute bottom-0 left-[55%] top-0 w-px bg-paper" />
                      </div>
                      <div className="mt-1 flex justify-between font-mono text-[11.5px] text-faint">
                        <span>0.0</span>
                        <span>0.55</span>
                        <span>1.0</span>
                      </div>
                      <div className="mt-0.5 flex justify-between text-[11px] text-faint">
                        <span>low slick score</span>
                        <span>threshold</span>
                        <span>high slick score</span>
                      </div>
                    </div>
                  </figcaption>
                </figure>

                {/* Arrow → (desktop) */}
                <div className="hidden items-center justify-center text-[22px] text-faint md:flex">
                  {"\u2192"}
                </div>
                {/* Arrow ↓ (mobile) */}
                <div className="flex items-center justify-center text-[22px] text-faint md:hidden">
                  {"\u2193"}
                </div>

                {/* Threshold */}
                <div className="flex flex-col items-center justify-center py-2">
                  <span className="tnum font-mono text-[46px] font-semibold leading-none text-ink">
                    {DETECTION.threshold}
                  </span>
                  <span className="mt-2 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-faint">
                    Selected threshold
                  </span>
                </div>

                {/* Arrow → (desktop) */}
                <div className="hidden items-center justify-center text-[22px] text-faint md:flex">
                  {"\u2192"}
                </div>
                {/* Arrow ↓ (mobile) */}
                <div className="flex items-center justify-center text-[22px] text-faint md:hidden">
                  {"\u2193"}
                </div>

                {/* Binary mask */}
                <figure className="w-full">
                  <div className="border border-line bg-paper-2 p-2">
                    <Image
                      src="/data/detection/2018_09_26_binary_roi.png"
                      alt="Focused view of the binary slick mask — amber pixels retained as predicted slick on a light background"
                      width={1500}
                      height={1549}
                      unoptimized
                      loading="lazy"
                      className="block h-auto w-full"
                    />
                  </div>
                  <figcaption className="mt-3">
                    <div className="text-[13px] font-semibold text-ink">
                      Binary mask
                    </div>
                    <p className="mt-0.5 text-[13.5px] leading-snug text-ink-2">
                      The thresholded result becomes a yes/no mask used for
                      geospatial polygon extraction. Pixels scored at or above
                      the threshold are retained as predicted slick.
                    </p>
                    <div className="mt-3 flex items-center gap-5 text-[12px] text-ink-2">
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block h-3 w-3 shrink-0"
                          style={{ backgroundColor: "#8a5a1e" }}
                        />
                        Predicted slick
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="inline-block h-3 w-3 shrink-0 border border-[#c6c1b3] bg-paper" />
                        Background
                      </span>
                    </div>
                    <p className="mt-2.5 text-[13px] font-semibold text-ink">
                      {DETECTION.pixelsAtThreshold.toLocaleString("en-US")} px
                      predicted slick (score {"\u2265"} {DETECTION.threshold})
                    </p>
                  </figcaption>
                </figure>
              </div>

              <p className="mt-7 text-[12.5px] leading-relaxed text-faint">
                Real U-Net probability raster {"\u00b7"} threshold 0.55 {"\u00b7"}{" "}
                {DETECTION.pixelsAtThreshold.toLocaleString("en-US")} predicted
                slick pixels {"\u00b7"} full technical provenance in{" "}
                <span className="font-mono">model_output_provenance.json</span>.
              </p>
            </div>
          </div>

          {/* Stage 4 */}
          <div className="stage-block py-8">
            <div className="mb-4 flex items-baseline gap-4">
              <span className="font-mono text-[28px] font-semibold leading-none text-line-strong">
                04
              </span>
              <h3 className="text-[20px] font-semibold tracking-tight text-ink">
                Georeferenced Slick Output
              </h3>
            </div>

            <div className="ml-[52px]">
              <p className="max-w-[640px] text-[16px] leading-relaxed text-ink-2">
                The binary mask is converted to a georeferenced polygon in UTM
                zone 16N and projected to WGS 84. This is the predicted slick
                geometry used in the vessel correlation investigation.
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/*  SLICK MAP — The visual payoff                               */}
        {/* ============================================================ */}

        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-faint">
            Predicted Slick Geometry
          </h2>
          <span className="text-[12px] text-faint">
            Output of stage 04
          </span>
        </div>

        {slick ? (
          <>
            <div className="screen-only">
              <SlickMap slick={slick} height={440} />
            </div>
            <div className="print-only">
              <SlickFigure slick={slick} />
            </div>
          </>
        ) : (
          <div className="flex h-[440px] items-center justify-center border border-line bg-paper-2 screen-only">
            <p className="text-[14px] text-faint">Loading slick geometry…</p>
          </div>
        )}

        {/* Output metrics — positioned directly under the figure */}
        <div className="mt-6 grid grid-cols-2 gap-x-10 gap-y-5 border-t border-line pt-6 md:grid-cols-4">
          <div>
            <div className="text-[12px] font-medium uppercase tracking-[0.04em] text-faint">
              Main predicted slick
            </div>
            <div className="mt-1 font-mono text-[22px] font-semibold text-ink">
              {DETECTION.mainSlickArea.toFixed(2)} km{"\u00b2"}
            </div>
          </div>
          <div>
            <div className="text-[12px] font-medium uppercase tracking-[0.04em] text-faint">
              Total retained area
            </div>
            <div className="mt-1 font-mono text-[22px] font-semibold text-ink">
              {DETECTION.retainedArea.toFixed(2)} km{"\u00b2"}
            </div>
          </div>
          <div>
            <div className="text-[12px] font-medium uppercase tracking-[0.04em] text-faint">
              Regions retained
            </div>
            <div className="mt-1 font-mono text-[22px] font-semibold text-ink">
              {DETECTION.retainedRegions}
            </div>
          </div>
          <div>
            <div className="text-[12px] font-medium uppercase tracking-[0.04em] text-faint">
              Centroid
            </div>
            <div className="mt-1 font-mono text-[15px] font-semibold text-ink">
              {DETECTION.centroidLat.toFixed(4)}{"\u00b0"} N, {Math.abs(DETECTION.centroidLon).toFixed(4)}{"\u00b0"} W
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/*  MODEL PERFORMANCE                                           */}
        {/* ============================================================ */}

        <div className="mt-16">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-faint">
            Model Performance
          </h2>
        </div>

        {/* Held-out test set */}
        <div className="mt-6">
          <div className="mb-1 flex items-baseline gap-3">
            <h3 className="text-[16px] font-semibold text-ink">Held-out test set</h3>
            <span className="text-[13px] text-faint">
              {MODEL.testPatches} patches across {MODEL.testScenes} untouched scenes
            </span>
          </div>

          <div className="mt-4 space-y-0">
            {(
              [
                ["Dice", METRICS.heldOut.dice],
                ["IoU", METRICS.heldOut.iou],
                ["Precision", METRICS.heldOut.precision],
                ["Recall", METRICS.heldOut.recall],
                ["Specificity", METRICS.heldOut.specificity],
              ] as const
            ).map(([name, value], i) => (
              <div
                key={name}
                className={`flex items-baseline gap-6 py-3 ${i < 4 ? "border-b border-line" : ""}`}
              >
                <span className="w-[120px] shrink-0 text-[14px] font-medium text-ink">
                  {name}
                </span>
                <span className="tnum w-[80px] shrink-0 font-mono text-[20px] font-semibold text-ink">
                  {value.toFixed(4)}
                </span>
                <span className="text-[14px] leading-snug text-ink-2">
                  {METRIC_EXPLANATIONS[name]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* This demo scene */}
        <div className="mt-8">
          <div className="mb-1 flex items-baseline gap-3">
            <h3 className="text-[16px] font-semibold text-ink">This demo scene</h3>
            <span className="text-[13px] text-faint">{SCENE.sceneId}</span>
          </div>

          <div className="mt-4 grid grid-cols-5 gap-px bg-line">
            {(
              [
                ["Dice", METRICS.thisScene.dice],
                ["IoU", METRICS.thisScene.iou],
                ["Precision", METRICS.thisScene.precision],
                ["Recall", METRICS.thisScene.recall],
                ["Specificity", METRICS.thisScene.specificity],
              ] as const
            ).map(([name, value]) => (
              <div key={name} className="bg-paper px-4 py-4 text-center">
                <div className="tnum text-[22px] font-semibold text-ink">
                  {value.toFixed(3)}
                </div>
                <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.04em] text-faint">
                  {name}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-3 text-[13px] leading-relaxed text-faint">
            Scene-specific performance is higher than held-out averages because
            this scene was among those the model handled relatively well.
          </p>
        </div>

        {/* ============================================================ */}
        {/*  LIMITATIONS — Editorial statement                           */}
        {/* ============================================================ */}

        <div className="mt-16 border-t border-line pt-10">
          <h2 className="mb-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-faint">
            What the model can{"\u2014"}and cannot{"\u2014"}claim
          </h2>

          <div className="max-w-[720px] space-y-4 text-[15px] leading-relaxed text-ink-2">
            <p>
              The U-Net model identifies regions in Sentinel-1 SAR imagery that
              <span className="font-medium text-ink"> resemble oil slicks</span>.
              It does not confirm the presence of oil. SAR look-alikes{"\u2014"}including
              low-wind zones and biogenic films{"\u2014"}can produce similar
              signatures in satellite data.
            </p>
            <p>
              Performance varies between satellite scenes. The current model is a
              <span className="font-medium text-ink"> validated prototype</span>,
              not a production monitoring system. It was trained on Gulf of Mexico
              data, and additional regional validation is required before broader
              application.
            </p>
            <p>
              Detection results are intended to
              <span className="font-medium text-ink"> assist investigators</span>,
              not replace expert analysis. Every predicted slick must be reviewed
              by a qualified analyst before any operational decision is made.
            </p>
          </div>
        </div>

        {/* ============================================================ */}
        {/*  NAVIGATION                                                  */}
        {/* ============================================================ */}

        <div className="mt-16 flex items-center justify-between border-t border-line pt-6">
          <Link
            href="/"
            className="text-[15px] font-medium text-marine hover:text-ink"
          >
            {"\u2190"} Back to investigation
          </Link>
          <Link
            href="/"
            className="text-[15px] font-medium text-marine hover:text-ink"
          >
            View candidate correlation {"\u2192"}
          </Link>
        </div>
      </main>

      {/* ---- Footer ---- */}
      <footer className="mt-8 border-t border-line px-6 py-4 text-[12px] text-faint">
        SlickTrace {"\u00b7"} SIH26143 {"\u00b7"} Validated Investigation Replay
      </footer>
    </div>
  );
}
