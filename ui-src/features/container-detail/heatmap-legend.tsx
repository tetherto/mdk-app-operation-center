import {
  HEAT_RAMP,
  HEATMAP_METRIC_SPECS,
  type HeatmapMetric,
  type HeatScale,
  heatTicksOf,
} from "./heatmap-shape";

type HeatmapLegendProps = { metric: HeatmapMetric; scale: HeatScale };

/**
 * The colour scale under the grid: the metric and the keys for a miner with no
 * reading and an empty socket, the ramp coolest to hottest, and the container's
 * coolest, median and hottest reading under its ends and middle.
 */
export const HeatmapLegend = ({ metric, scale }: HeatmapLegendProps) => {
  const ticks = heatTicksOf(metric, scale);

  return (
    <div className="op-centre-lite-heat-legend" aria-label="Colour scale">
      <div className="op-centre-lite-heat-legend__top">
        <span className="op-centre-lite-heat-legend__title">
          {HEATMAP_METRIC_SPECS[metric].label}
        </span>
        <span className="op-centre-lite-heat-legend__keys">
          <span className="op-centre-lite-heat-legend__key">
            <span data-heat="none" aria-hidden="true" />
            No metric
          </span>
          <span className="op-centre-lite-heat-legend__key">
            <span data-state="empty" aria-hidden="true" />
            Vacant
          </span>
        </span>
      </div>
      <div
        className="op-centre-lite-heat-legend__ramp"
        style={{ background: HEAT_RAMP }}
        aria-hidden="true"
      />
      {/* The row keeps its height with no readings, so the legend does not jump. */}
      <div className="op-centre-lite-heat-legend__ticks">
        {ticks === undefined ? null : (
          <>
            <span>{ticks.low}</span>
            <span>{ticks.median}</span>
            <span>{ticks.high}</span>
          </>
        )}
      </div>
    </div>
  );
};
