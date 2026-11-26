import type { ReactNode } from "react";

import type { MetricRow } from "./layout-shape";

type SidePanelProps = {
  /** The container's name. */
  title: string;
  /** Where the selected miner sits (its rack, then its socket), a count of picked sockets, or a prompt to pick one. */
  subtitle: string;
  children: ReactNode;
};

/** The right column of the container page: the container and where the selection sits, then sections. */
export const SidePanel = ({ title, subtitle, children }: SidePanelProps) => (
  <aside className="op-centre-lite-side-panel" aria-label={title}>
    <div className="op-centre-lite-side-panel__head">
      <span className="op-centre-lite-side-panel__title">{title}</span>
      <span className="op-centre-lite-side-panel__subtitle">{subtitle}</span>
    </div>
    {children}
  </aside>
);

type PanelSectionProps = { title: string; children: ReactNode };

export const PanelSection = ({ title, children }: PanelSectionProps) => (
  <section className="op-centre-lite-side-panel__section" aria-label={title}>
    <h3 className="op-centre-lite-side-panel__section-title">{title}</h3>
    {children}
  </section>
);

/** Readings in two columns, label over value; a status value takes its socket's colour. */
export const MetricGrid = ({ rows }: { rows: MetricRow[] }) => (
  <dl className="op-centre-lite-metric-grid">
    {rows.map(({ label, value, state }) => (
      <div key={label} className="op-centre-lite-metric-grid__item">
        <dt>{label}</dt>
        <dd data-state={state}>{value}</dd>
      </div>
    ))}
  </dl>
);

/** Shown in a section that needs a selected socket while none is. */
export const PanelHint = ({ children }: { children: ReactNode }) => (
  <p className="op-centre-lite-side-panel__hint">{children}</p>
);

/** The panel's subtitle while no socket is selected. */
export const NO_SOCKET_SELECTED = "Select a socket";
