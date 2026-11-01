import {
  Button,
  ExportIcon,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tetherto/mdk-react-devkit";

import type { ContainerOption, ExplorerFilter } from "./explorer-shape";

// Radix Select items cannot have an empty value, so "every container" needs a
// value of its own; the select's own empty value shows the "Container" placeholder.
const ALL_CONTAINERS = "all";
const NO_SELECTION = "";

type ExplorerToolbarProps = {
  filter: ExplorerFilter;
  containers: ContainerOption[];
  /** What the current tab's search matches. */
  searchPlaceholder: string;
  onFilterChange: (filter: ExplorerFilter) => void;
  onExport: () => void;
  exporting: boolean;
};

/** Search, container filter and CSV export, shared by the Racks and Miners tabs. */
export const ExplorerToolbar = ({
  filter,
  containers,
  searchPlaceholder,
  onFilterChange,
  onExport,
  exporting,
}: ExplorerToolbarProps) => (
  <div className="op-centre-lite-explorer__toolbar">
    <Input
      variant="search"
      aria-label="Search"
      placeholder={searchPlaceholder}
      value={filter.search}
      onChange={(event) => onFilterChange({ ...filter, search: event.target.value })}
      wrapperClassName="op-centre-lite-explorer__search"
    />
    <Select
      value={filter.containerId ?? NO_SELECTION}
      onValueChange={(value) =>
        onFilterChange({ ...filter, containerId: value === ALL_CONTAINERS ? undefined : value })
      }
    >
      <SelectTrigger aria-label="Container" className="op-centre-lite-explorer__container">
        <SelectValue placeholder="Container" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_CONTAINERS}>All containers</SelectItem>
        {containers.map((container) => (
          <SelectItem key={container.id} value={container.id}>
            {container.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <Button variant="secondary" icon={<ExportIcon />} loading={exporting} onClick={onExport}>
      Export CSV
    </Button>
  </div>
);
