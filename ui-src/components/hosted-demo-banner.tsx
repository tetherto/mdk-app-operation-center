import { CoreAlert } from "@tetherto/mdk-react-devkit";

import { useSiteConfig } from "../features/site-config/use-site-config";

/**
 * Tells a visitor of the hosted demo (`commandsEnabled: false`) that the data
 * is live but commands are off, and where to get the app: the config's
 * `downloadUrl`, no button without one. Nothing on a site that sends commands,
 * or while the config loads.
 */
export const HostedDemoBanner = () => {
  const config = useSiteConfig();
  if (config?.commandsEnabled !== false) return null;

  return (
    <CoreAlert
      className="op-centre-lite-demo-banner"
      type="info"
      showIcon
      title="This hosted demo shows live data but can't send commands."
      description="Power controls are off. Install the app on your own site to use them."
      action={
        config.downloadUrl === null ? undefined : (
          <a
            className="mdk-button mdk-button--variant-primary"
            href={config.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Download the App
          </a>
        )
      }
    />
  );
};
