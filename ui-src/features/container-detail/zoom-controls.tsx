import { Button } from "@tetherto/mdk-react-devkit";

import { DEFAULT_ZOOM, ZOOM_LEVELS, type Zoom } from "./socket-grid";

type ZoomControlsProps = { zoom: Zoom; onZoomChange: (zoom: Zoom) => void };

/** Zoom out, in and reset for the socket grid, one level at a time. */
export const ZoomControls = ({ zoom, onZoomChange }: ZoomControlsProps) => {
  const index = ZOOM_LEVELS.indexOf(zoom);
  const smaller = ZOOM_LEVELS[index - 1];
  const larger = ZOOM_LEVELS[index + 1];

  return (
    <div className="op-centre-lite-zoom" role="group" aria-label="Zoom">
      <Button
        variant="secondary"
        size="sm"
        aria-label="Zoom out"
        disabled={smaller === undefined}
        onClick={() => smaller !== undefined && onZoomChange(smaller)}
      >
        -
      </Button>
      <Button
        variant="secondary"
        size="sm"
        aria-label="Zoom in"
        disabled={larger === undefined}
        onClick={() => larger !== undefined && onZoomChange(larger)}
      >
        +
      </Button>
      <Button
        variant="secondary"
        size="sm"
        disabled={zoom === DEFAULT_ZOOM}
        onClick={() => onZoomChange(DEFAULT_ZOOM)}
      >
        Reset
      </Button>
    </div>
  );
};
