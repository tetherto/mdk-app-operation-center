type ValueWithUnitProps = { value: string; unit: string; className?: string };

/** A number large with its unit small and dimmed beside it, as the design sets headline figures. */
export const ValueWithUnit = ({ value, unit, className }: ValueWithUnitProps) => (
  <span className={["op-centre-lite-value-with-unit", className].filter(Boolean).join(" ")}>
    <span className="op-centre-lite-value-with-unit__value">{value}</span>
    <span className="op-centre-lite-value-with-unit__unit">{unit}</span>
  </span>
);
