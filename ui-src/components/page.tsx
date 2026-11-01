import { Typography } from "@tetherto/mdk-react-devkit";
import type { ReactNode } from "react";

import { SiteStatsStrip } from "../features/site-summary/site-stats-strip";
import { useSiteSummary } from "../features/site-summary/use-site-summary";
import { HostedDemoBanner } from "./hosted-demo-banner";

type PageProps = {
  title: string;
  /** A line under the title, e.g. what the page counts. */
  subtitle?: string;
  /** Controls shown opposite the title (filters, exports, range toggles). */
  actions?: ReactNode;
  children: ReactNode;
};

/**
 * The frame every Operation Center Lite page renders in: the site stats strip,
 * the hosted demo banner when commands are off, then the page title and its
 * actions. The stats live here, not in the dashboard header, because an app
 * cannot add to the host dashboard's header.
 */
export const Page = ({ title, subtitle, actions, children }: PageProps) => {
  const summary = useSiteSummary();

  return (
    <section className="op-centre-lite-page">
      <SiteStatsStrip view={summary} />
      <HostedDemoBanner />
      <header className="op-centre-lite-page__header">
        <div>
          <Typography variant="heading1">{title}</Typography>
          {subtitle === undefined ? null : (
            <Typography variant="secondary" size="sm">
              {subtitle}
            </Typography>
          )}
        </div>
        {actions === undefined ? null : (
          <div className="op-centre-lite-page__actions">{actions}</div>
        )}
      </header>
      {children}
    </section>
  );
};
