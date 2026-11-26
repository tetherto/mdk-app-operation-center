import { ExportIcon } from "@tetherto/mdk-react-devkit";

import { useSiteConfig } from "../features/site-config/use-site-config";

/**
 * Tells a visitor of the hosted demo (`commandsEnabled: false`) that the data
 * is live but commands are off, as the design's read-only notice words it.
 * Nothing on a site that sends commands, or while the config loads.
 */
export const HostedDemoBanner = () => {
  const config = useSiteConfig();
  if (config?.commandsEnabled !== false) return null;

  return (
    <p className="op-centre-lite-demo-banner" role="status">
      This hosted demo shows live data but can't send commands to miners. Download and run it
      locally to change power modes.
    </p>
  );
};

/**
 * Where to get the app, opposite the page title on the hosted demo: the
 * config's `downloadUrl`. Nothing without one, or on a site that sends commands.
 */
export const DownloadAppButton = () => {
  const config = useSiteConfig();
  if (config?.commandsEnabled !== false || config.downloadUrl === null) return null;

  return (
    <a
      className="op-centre-lite-download-app"
      href={config.downloadUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      <ExportIcon />
      Download the App
    </a>
  );
};
