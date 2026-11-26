import {
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
const RANGE_FORMAT = "dd/MM/yy";

type ChartsTabProps = { layout: LayoutView };

/**
 * The container's hash rate against nominal and its power consumption over
 * the picked days, for the whole container or one rack.
 */
export const ChartsTab = ({ layout }: ChartsTabProps) => {
  const charts = useContainerCharts(layout);

  return (
    <div className="op-centre-lite-charts">
      <div className="op-centre-lite-charts__toolbar">
        <DateRangePicker
          selected={charts.range}
          onSelect={charts.onRangeChange}
          dateFormat={RANGE_FORMAT}
          triggerClassName="op-centre-lite-charts__range"
        />
        <Select
          value={charts.rackId ?? ALL_RACKS}
          onValueChange={(value) => charts.onRackChange(value === ALL_RACKS ? undefined : value)}
        >
          <SelectTrigger aria-label="Rack" className="op-centre-lite-charts__rack">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_RACKS}>All Racks</SelectItem>
            {layout.racks.map((rack) => (
              <SelectItem key={rack.id} value={rack.id}>
                {rack.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <HistoryChartCard title="Hash Rate" {...charts.hashrate} />
      <HistoryChartCard title="Power Consumption" {...charts.power} fill />
    </div>
  );
};
