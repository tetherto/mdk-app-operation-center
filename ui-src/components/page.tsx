import { Typography } from "@tetherto/mdk-react-devkit";
import type { ReactNode } from "react";

import { SiteStatsStrip } from "../features/site-summary/site-stats-strip";
import { useSiteSummary } from "../features/site-summary/use-site-summary";
import { DownloadAppButton, HostedDemoBanner } from "./hosted-demo-banner";

type PageProps = {
  title: string;
  /** A line under the title, e.g. what the page counts, or a link back. */
  subtitle?: ReactNode;
  /** Controls shown opposite the title (filters, exports, range toggles). */
  actions?: ReactNode;
  /** Sets one page's own header styles. */
  className?: string;
  /**
   * Where the hosted demo's notice goes: under the header (the default), or
   * nowhere when the page places it itself (under the container page's tabs).
   */
  demoNotice?: "header" | "page";
  children: ReactNode;
};

/**
 * The frame every Operation Center Lite page renders in: the site stats strip,
 * then the page title and its actions, then the hosted demo's notice when
 * commands are off (with "Download the App" beside the title). The stats live here, not in the dashboard header, because an app
 * cannot add to the host dashboard's header.
 */
export const Page = ({
  title,
  subtitle,
  actions,
  className,
  demoNotice = "header",
  children,
}: PageProps) => {
  const summary = useSiteSummary();

  return (
    <section
      className={
        className === undefined ? "op-centre-lite-page" : `op-centre-lite-page ${className}`
      }
    >
      <SiteStatsStrip view={summary} />
      <header className="op-centre-lite-page__header">
        <div>
          <Typography variant="heading1">{title}</Typography>
          {subtitle === undefined ? null : typeof subtitle === "string" ? (
            <p className="op-centre-lite-page__subtitle">{subtitle}</p>
          ) : (
            subtitle
          )}
        </div>
        <div className="op-centre-lite-page__actions">
          {actions}
          <DownloadAppButton />
        </div>
      </header>
      {demoNotice === "header" ? <HostedDemoBanner /> : null}
      {children}
    </section>
  );
};
