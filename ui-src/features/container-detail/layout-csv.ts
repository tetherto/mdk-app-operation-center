import { type CsvColumn, csvNumber } from "../../lib/csv";
import { DISPLAY_FRACTION_DIGITS, DISPLAY_UNITS, wToKw } from "../../lib/units";
import {
  type LayoutSocket,
  type LayoutView,
  orderedSockets,
  SOCKET_STATE_LABELS,
} from "./layout-shape";

type SocketRow = { rack: string; socket: LayoutSocket };

/** One row per socket, empty ones included, as numbers in the units the headers name. */
export const SOCKET_CSV_COLUMNS: CsvColumn<SocketRow>[] = [
  { header: "Rack", value: (row) => row.rack },
  { header: "Position", value: (row) => row.socket.position },
  { header: "Serial", value: (row) => row.socket.miner?.serial },
  { header: "IP", value: (row) => row.socket.miner?.ip },
  { header: "Status", value: (row) => SOCKET_STATE_LABELS[row.socket.state] },
  {
    header: "Socket Power",
    value: (row) => (row.socket.power === "unknown" ? undefined : row.socket.power),
  },
  {
    header: `Current (${DISPLAY_UNITS.CURRENT})`,
    value: (row) => csvNumber(row.socket.currentA ?? undefined, DISPLAY_FRACTION_DIGITS.CURRENT),
  },
  {
    header: `Consumption (${DISPLAY_UNITS.POWER_KW})`,
    value: (row) =>
      csvNumber(
        row.socket.miner === null ? undefined : wToKw(row.socket.miner.powerW),
        DISPLAY_FRACTION_DIGITS.POWER_KW_MINER,
      ),
  },
  {
    header: `Hash rate (${DISPLAY_UNITS.HASHRATE_TH})`,
    value: (row) => csvNumber(row.socket.miner?.hashrateThs, DISPLAY_FRACTION_DIGITS.HASHRATE_TH),
  },
  {
    header: `Power (${DISPLAY_UNITS.PERCENT})`,
    value: (row) => row.socket.miner?.powerPct ?? undefined,
  },
  {
    header: `Inlet temperature (${DISPLAY_UNITS.TEMPERATURE})`,
    value: (row) => csvNumber(row.socket.miner?.inletTempC, DISPLAY_FRACTION_DIGITS.TEMPERATURE),
  },
];

/** The container's sockets in position order, each with its rack's name. */
export const socketRowsOf = (layout: LayoutView): SocketRow[] => {
  const rackOf = new Map(
    layout.racks.flatMap((rack) => rack.sockets.map((socket) => [socket.position, rack.name])),
  );
  return orderedSockets(layout).map((socket) => ({
    rack: rackOf.get(socket.position) ?? "",
    socket,
  }));
};

/** The export's file name: the container's id, which is safe in a file name. */
export const socketCsvFileName = (layout: LayoutView): string =>
  `${layout.container.id}-sockets.csv`;
