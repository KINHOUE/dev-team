import { seriesColor } from '../../lib/chartColors';

export interface DonutSlice {
  label: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}

/** Donut SVG custom (aucune dépendance) — segments proportionnels au total. */
export default function DonutChart({
  data,
  size = 190,
  thickness = 24,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + Math.max(0, d.value), 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let offset = 0;
  const slices =
    total > 0
      ? data
          .filter((d) => d.value > 0)
          .map((d, index) => {
            const dash = (d.value / total) * circumference;
            const dashoffset = -offset;
            offset += dash;
            return { ...d, dash, dashoffset, color: d.color ?? seriesColor(index) };
          })
      : [];

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="h-full w-full"
      role="img"
      aria-label="Répartition des dépenses"
    >
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="rgb(var(--ds-surface-raised))"
        strokeWidth={thickness}
      />
      {slices.map((slice, index) => (
        <circle
          key={index}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={slice.color}
          strokeWidth={thickness}
          strokeDasharray={`${slice.dash} ${circumference - slice.dash}`}
          strokeDashoffset={slice.dashoffset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      ))}
      {centerValue && (
        <text
          x={center}
          y={center - 2}
          textAnchor="middle"
          fill="rgb(var(--ds-text))"
          fontSize={size * 0.125}
          fontWeight={600}
        >
          {centerValue}
        </text>
      )}
      {centerLabel && (
        <text
          x={center}
          y={center + size * 0.105}
          textAnchor="middle"
          fill="rgb(var(--ds-text-muted))"
          fontSize={size * 0.062}
        >
          {centerLabel}
        </text>
      )}
    </svg>
  );
}
