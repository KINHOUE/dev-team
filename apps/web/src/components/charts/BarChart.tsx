export interface BarDatum {
  label: string;
  value: number;
  highlight?: boolean;
}

interface BarChartProps {
  data: BarDatum[];
  formatValue?: (value: number) => string;
  height?: number;
}

/** Histogramme SVG/CSS custom — une barre par période. */
export default function BarChart({ data, formatValue, height = 170 }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const plotHeight = height - 36;

  return (
    <div className="flex items-end gap-2" style={{ height }} role="img" aria-label="Dépenses par mois">
      {data.map((datum, index) => {
        const barHeight =
          datum.value > 0 ? Math.max(5, (datum.value / max) * plotHeight) : 3;
        return (
          <div key={index} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <span className="truncate text-[10px] leading-none text-text-muted">
              {datum.value > 0 && formatValue ? formatValue(datum.value) : ''}
            </span>
            <div
              className="w-full rounded-t-md transition-all"
              style={{
                height: barHeight,
                background: datum.highlight
                  ? 'rgb(var(--ds-accent))'
                  : 'rgb(var(--ds-accent) / 0.32)',
              }}
              title={formatValue ? formatValue(datum.value) : String(datum.value)}
            />
            <span className="truncate text-[10px] leading-none text-text-muted">
              {datum.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
