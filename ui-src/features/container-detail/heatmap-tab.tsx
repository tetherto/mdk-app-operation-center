import {
  Button,
  ExportIcon,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tetherto/mdk-react-devkit";

import { PowerCommandControls } from "../commands/power-command-controls";
import { HeatmapLegend } from "./heatmap-legend";
import { HEATMAP_METRIC_SPECS, HEATMAP_METRICS, type HeatmapMetric } from "./heatmap-shape";
import type { LayoutView } from "./layout-shape";
import { MinerPanel } from "./miner-panel";
import { SocketGrid } from "./socket-grid";
import { useHeatmap } from "./use-heatmap";
import { useMinerLogsDownload } from "./use-miner-logs-download";
import { useSocketSelection } from "./use-socket-selection";
import { ZoomControls } from "./zoom-controls";

const isHeatmapMetric = (value: string): value is HeatmapMetric =>
  HEATMAP_METRICS.some((metric) => metric === value);

type HeatmapTabProps = { layout: LayoutView };

/**
 * The container's sockets coloured by one metric against the container's own
 * range, inlet temperature first. Selecting a miner opens its readings with
 * its power controls and a log download.
 */
export const HeatmapTab = ({ layout }: HeatmapTabProps) => {
  const heatmap = useHeatmap(layout);
  const selection = useSocketSelection(layout);
  const logs = useMinerLogsDownload();
  const { selected } = selection;

  return (
    <div className="op-centre-lite-layout">
      <div className="op-centre-lite-layout__toolbar">
        <div className="op-centre-lite-heatmap__controls">
          <Select
            value={heatmap.metric}
            onValueChange={(value) => {
              if (isHeatmapMetric(value)) heatmap.onMetricChange(value);
            }}
          >
            <SelectTrigger aria-label="Metric" className="op-centre-lite-heatmap__metric">
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
          <HeatmapLegend metric={heatmap.metric} scale={heatmap.scale} />
        </div>
        <ZoomControls zoom={selection.zoom} onZoomChange={selection.onZoomChange} />
      </div>
      <div className="op-centre-lite-layout__body">
        <SocketGrid
          racks={layout.racks}
          zoom={selection.zoom}
          selectedMinerId={selected?.id}
          onSelect={selection.onSelect}
          heatOf={heatmap.heatOf}
        />
        {selected === undefined ? null : (
          <MinerPanel
            miner={selected}
            onClose={selection.onClear}
            actions={
              <>
                <PowerCommandControls
                  className="op-centre-lite-miner-panel__controls"
                  target={{ minerIds: [selected.id] }}
                  targetName={selected.serial}
                  supportedPowerModes={selected.supportedPowerModes}
                  currentMode={selected.powerMode}
                  currentPct={selected.powerPct}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<ExportIcon />}
                  loading={logs.isDownloading(selected.id)}
                  onClick={() => logs.download(selected)}
                >
                  Download Logs
                </Button>
              </>
            }
          />
        )}
      </div>
    </div>
  );
};
