import {
  Button,
  DateRangePicker,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tetherto/mdk-react-devkit";

import { HistoryChartCard } from "../history/history-chart-card";
import type { LayoutView } from "./layout-shape";
import { useContainerCharts } from "./use-container-charts";

// Radix Select items cannot have an empty value, so "every rack" has its own.
const ALL_RACKS = "all";

type ChartsTabProps = { layout: LayoutView };

/**
 * The container's hash rate against nominal and its power consumption, for the
 * whole container or one rack. Live by default; a picked date range fixes the
 * window, and each chart's interval toggle offers only the intervals that fit it.
 */
export const ChartsTab = ({ layout }: ChartsTabProps) => {
  const charts = useContainerCharts(layout);

  return (
    <div className="op-centre-lite-charts">
      <div className="op-centre-lite-charts__toolbar">
        <Select
          value={charts.rackId ?? ALL_RACKS}
          onValueChange={(value) => charts.onRackChange(value === ALL_RACKS ? undefined : value)}
        >
          <SelectTrigger aria-label="Rack" className="op-centre-lite-charts__rack">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_RACKS}>All racks</SelectItem>
            {layout.racks.map((rack) => (
              <SelectItem key={rack.id} value={rack.id}>
                {rack.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DateRangePicker
          selected={charts.range}
          onSelect={charts.onRangeChange}
          placeholder="Live: latest readings"
        />
        {charts.isLive ? null : (
          <Button variant="secondary" size="sm" onClick={() => charts.onRangeChange(undefined)}>
            Back to live
          </Button>
        )}
      </div>
      <HistoryChartCard
        title="Hash Rate"
        {...charts.hashrate}
        allowedIntervals={charts.allowedIntervals}
        spansDays={charts.spansDays}
      />
      <HistoryChartCard
        title="Power Consumption"
        {...charts.power}
        allowedIntervals={charts.allowedIntervals}
        spansDays={charts.spansDays}
      />
    </div>
  );
};
