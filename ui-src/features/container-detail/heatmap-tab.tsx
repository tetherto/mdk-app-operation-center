import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tetherto/mdk-react-devkit";

import { FALLBACK } from "../../lib/constants";
import { PowerCommandControls } from "../commands/power-command-controls";
import { HeatmapLegend } from "./heatmap-legend";
import { HEATMAP_METRIC_SPECS, HEATMAP_METRICS, type HeatmapMetric } from "./heatmap-shape";
import { heatmapMetricsOf, type LayoutView, minerNameOf, socketLabelOf } from "./layout-shape";
import { MetricGrid, NO_SOCKET_SELECTED, PanelHint, PanelSection, SidePanel } from "./side-panel";
import { useHeatmap } from "./use-heatmap";
import { useMinerLogsDownload } from "./use-miner-logs-download";
import { useSocketSelection } from "./use-socket-selection";
import { Workbench } from "./workbench";

const isHeatmapMetric = (value: string): value is HeatmapMetric =>
  HEATMAP_METRICS.some((metric) => metric === value);

const METRIC_LABEL_ID = "op-centre-lite-heatmap-metric";

type HeatmapTabProps = { layout: LayoutView };

/**
 * The container's sockets coloured by one metric, inlet temperature first.
 * Selecting a miner shows its power mode control, its log download and its
 * readings beside the grid.
 */
export const HeatmapTab = ({ layout }: HeatmapTabProps) => {
  const heatmap = useHeatmap(layout);
  const selection = useSocketSelection(layout);
  const logs = useMinerLogsDownload();
  const { selected } = selection;
  const miner = selected?.miner;

  return (
    <div className="op-centre-lite-detail-body">
      <Workbench
        layout={layout}
        actions={
          <div className="op-centre-lite-heatmap__metric">
            <span id={METRIC_LABEL_ID}>Metric</span>
            <Select
              value={heatmap.metric}
              onValueChange={(value) => {
                if (isHeatmapMetric(value)) heatmap.onMetricChange(value);
              }}
            >
              <SelectTrigger aria-labelledby={METRIC_LABEL_ID}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HEATMAP_METRICS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {HEATMAP_METRIC_SPECS[option].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
        legend={<HeatmapLegend metric={heatmap.metric} scale={heatmap.scale} />}
        faceOf={heatmap.faceOf}
        isSelected={selection.isSelected}
        onSelect={selection.onSelect}
      />
      <SidePanel
        title={layout.container.name}
        subtitle={selected === undefined ? NO_SOCKET_SELECTED : socketLabelOf(selected)}
      >
        {miner === undefined ? (
          <PanelSection title="Miner Metrics">
            <PanelHint>Select a socket to see its miner.</PanelHint>
          </PanelSection>
        ) : (
          <>
            <PanelSection title="Miner Controls">
              <div className="op-centre-lite-side-panel__controls">
                <PowerCommandControls
                  className="op-centre-lite-side-panel__power"
                  target={{ minerIds: [miner.id] }}
                  targetName={minerNameOf(miner)}
                  supportedPowerModes={miner.supportedPowerModes}
                  currentMode={miner.powerMode}
                  currentPct={miner.powerPct}
                  withPct={false}
                />
                <Button
                  variant="secondary"
                  className="op-centre-lite-tool"
                  loading={logs.isDownloading(miner.id)}
                  onClick={() => logs.download(miner)}
                >
                  Download Logs
                </Button>
              </div>
            </PanelSection>
            <PanelSection title="Miner Metrics">
              <MetricGrid rows={heatmapMetricsOf(miner, Date.now())} />
            </PanelSection>
            <PanelSection title="Miner Info">
              <dl className="op-centre-lite-side-panel__info">
                <dt>Serial</dt>
                <dd>{miner.serial === "" ? FALLBACK : miner.serial}</dd>
              </dl>
            </PanelSection>
          </>
        )}
      </SidePanel>
    </div>
  );
};
