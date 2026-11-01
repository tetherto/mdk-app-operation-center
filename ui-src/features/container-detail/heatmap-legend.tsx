import { Typography } from "@tetherto/mdk-react-devkit";

import { FALLBACK } from "../../lib/constants";
import {
  HEAT_STEPS,
  HEATMAP_METRIC_SPECS,
  type HeatmapMetric,
  type HeatScale,
} from "./heatmap-shape";

type HeatmapLegendProps = { metric: HeatmapMetric; scale: HeatScale };

/** The colour scale, coolest to hottest, between the container's lowest and highest reading. */
export const HeatmapLegend = ({ metric, scale }: HeatmapLegendProps) => {
  const { format } = HEATMAP_METRIC_SPECS[metric];
  return (
    <div className="op-centre-lite-heat-legend" aria-label="Colour scale">
      <Typography variant="secondary" size="sm">
        {scale === undefined ? "No readings" : format(scale.min)}
      </Typography>
      <span className="op-centre-lite-heat-legend__steps" aria-hidden="true">
        {Array.from({ length: HEAT_STEPS }, (_, step) => (
          <span key={step} className="op-centre-lite-heat-legend__step" data-heat={step} />
        ))}
      </span>
      <Typography variant="secondary" size="sm">
        {scale === undefined ? FALLBACK : format(scale.max)}
      </Typography>
    </div>
  );
};
