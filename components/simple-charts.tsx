"use client";

import { useMemo } from "react";

interface ChartData {
  [key: string]: any;
  shot?: number;
  score?: number;
  average?: number;
  cumulative?: number;
  count?: number;
}

interface LineConfig {
  dataKey: string;
  stroke: string;
  name?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  dots?: boolean;
}

interface SimpleLineChartProps {
  data: ChartData[];
  lines?: LineConfig[];
  width?: number;
  height?: number;
  xAxisKey?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  tooltipFormatter?: (label: string) => string;
}

export function SimpleLineChart({
  data,
  lines = [
    { dataKey: "score", stroke: "#3b82f6" },
    { dataKey: "average", stroke: "#ef4444" },
  ],
  width = 400,
  height = 300,
  xAxisKey = "shot",
  xAxisLabel = "Tir",
  yAxisLabel = "Score",
  tooltipFormatter = (label: string) => `Tir ${label}`,
}: SimpleLineChartProps) {
  const chartData = useMemo(() => {
    try {
      if (!data || data.length === 0) return null;

      const padding = 40;
      const chartWidth = width - padding * 2;
      const chartHeight = height - padding * 2;

      // Calculate max/min values from all lines with better safety checks
      const allValues = data.flatMap((point) =>
        lines
          .map((line) => {
            const value = point?.[line.dataKey];
            return typeof value === "number" && !isNaN(value) ? value : null;
          })
          .filter((val) => val !== null && val !== undefined)
      );

      if (allValues.length === 0) return null;

      const maxScore = Math.max(...allValues, 0);
      const minScore = Math.min(...allValues, 0);
      const scoreRange = maxScore - minScore || 1;

      // Generate points for each line with safety checks
      const linePoints = lines.map((line) => {
        return data
          .map((point, index) => {
            if (!point || typeof point !== "object") return null;

            const x = padding + (index / (data.length - 1 || 1)) * chartWidth;
            const value = point[line.dataKey];
            const y =
              typeof value === "number" && !isNaN(value)
                ? padding +
                  chartHeight -
                  ((value - minScore) / scoreRange) * chartHeight
                : null;

            return { x, y, value, xValue: point[xAxisKey] };
          })
          .filter((p) => p !== null && p.y !== null);
      });

      return {
        padding,
        chartWidth,
        chartHeight,
        maxScore,
        minScore,
        scoreRange,
        linePoints,
        xAxisPoints: data.map(
          (_, index) => padding + (index / (data.length - 1 || 1)) * chartWidth
        ),
        yAxisTicks: Array.from({ length: 6 }, (_, i) => {
          const value = minScore + (i / 5) * scoreRange;
          const y = padding + chartHeight - (i / 5) * chartHeight;
          return { value: Math.round(value * 10) / 10, y };
        }),
      };
    } catch (error) {
      console.error("Error in SimpleLineChart chartData calculation:", error);
      return null;
    }
  }, [data, lines, width, height, xAxisKey]);

  if (!chartData) {
    return (
      <div
        className="flex items-center justify-center text-gray-500"
        style={{ width, height }}
      >
        Aucune donnée à afficher
      </div>
    );
  }

  const {
    padding,
    chartWidth,
    chartHeight,
    linePoints,
    xAxisPoints,
    yAxisTicks,
  } = chartData;

  return (
    <div className="w-full h-full">
      <svg width={width} height={height} className="border rounded">
        {/* Grid lines */}
        <defs>
          <pattern
            id="grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect
          width={chartWidth}
          height={chartHeight}
          x={padding}
          y={padding}
          fill="url(#grid)"
        />

        {/* Y-axis */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={padding + chartHeight}
          stroke="#6b7280"
          strokeWidth="1"
        />

        {/* X-axis */}
        <line
          x1={padding}
          y1={padding + chartHeight}
          x2={padding + chartWidth}
          y2={padding + chartHeight}
          stroke="#6b7280"
          strokeWidth="1"
        />

        {/* Y-axis labels */}
        {yAxisTicks.map((tick, index) => (
          <g key={index}>
            <line
              x1={padding - 5}
              y1={tick.y}
              x2={padding}
              y2={tick.y}
              stroke="#6b7280"
              strokeWidth="1"
            />
            <text
              x={padding - 10}
              y={tick.y + 4}
              textAnchor="end"
              fontSize="12"
              fill="#6b7280"
            >
              {tick.value}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {data.map((point, index) => {
          if (!point || typeof point !== "object") return null;
          const x = xAxisPoints[index];
          const labelValue = point[xAxisKey];
          if (labelValue === undefined || labelValue === null) return null;

          return (
            <g key={index}>
              <line
                x1={x}
                y1={padding + chartHeight}
                x2={x}
                y2={padding + chartHeight + 5}
                stroke="#6b7280"
                strokeWidth="1"
              />
              <text
                x={x}
                y={padding + chartHeight + 20}
                textAnchor="middle"
                fontSize="12"
                fill="#6b7280"
              >
                {labelValue}
              </text>
            </g>
          );
        })}

        {/* Draw lines */}
        {linePoints.map((points, lineIndex) => {
          const line = lines[lineIndex];
          const validPoints = points.filter(
            (p): p is NonNullable<typeof p> => p !== null && p.y !== null
          );
          if (validPoints.length < 2) return null;

          const pathData = validPoints.reduce((acc, point, index) => {
            if (index === 0) {
              return `M ${point.x} ${point.y}`;
            }
            return `${acc} L ${point.x} ${point.y}`;
          }, "");

          return (
            <g key={lineIndex}>
              <path
                d={pathData}
                fill="none"
                stroke={line.stroke}
                strokeWidth={line.strokeWidth || 2}
                strokeDasharray={line.strokeDasharray}
              />
              {/* Draw dots if enabled */}
              {line.dots !== false &&
                validPoints.map((point, pointIndex) => (
                  <circle
                    key={pointIndex}
                    cx={point.x}
                    cy={point.y || 0}
                    r="3"
                    fill={line.stroke}
                    stroke="white"
                    strokeWidth="2"
                  />
                ))}
            </g>
          );
        })}

        {/* Axis labels */}
        <text
          x={padding + chartWidth / 2}
          y={height - 5}
          textAnchor="middle"
          fontSize="14"
          fill="#374151"
        >
          {xAxisLabel}
        </text>
        <text
          x={15}
          y={padding + chartHeight / 2}
          textAnchor="middle"
          fontSize="14"
          fill="#374151"
          transform={`rotate(-90, 15, ${padding + chartHeight / 2})`}
        >
          {yAxisLabel}
        </text>
      </svg>
    </div>
  );
}

// Simple precision chart for shooting accuracy
interface PrecisionChartProps {
  scores: number[];
  width?: number;
  height?: number;
}

export function PrecisionChart({
  scores,
  width = 300,
  height = 300,
}: PrecisionChartProps) {
  const chartData = useMemo(() => {
    if (!scores || scores.length === 0) return null;

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2 - 20;

    // Map scores to radial positions (assuming 10 is center, 0 is edge)
    const points = scores.map((score, index) => {
      const angle = (index / scores.length) * 2 * Math.PI;
      const radius = ((10 - score) / 10) * maxRadius;

      return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        score,
        angle: (angle * 180) / Math.PI,
      };
    });

    return { centerX, centerY, maxRadius, points };
  }, [scores, width, height]);

  if (!chartData) {
    return (
      <div
        className="flex items-center justify-center text-gray-500"
        style={{ width, height }}
      >
        Aucune donnée à afficher
      </div>
    );
  }

  const { centerX, centerY, maxRadius, points } = chartData;

  return (
    <div className="w-full h-full">
      <svg width={width} height={height} className="border rounded">
        {/* Target rings */}
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((ratio, index) => (
          <circle
            key={index}
            cx={centerX}
            cy={centerY}
            r={maxRadius * ratio}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}

        {/* Center point */}
        <circle cx={centerX} cy={centerY} r="3" fill="#ef4444" />

        {/* Score points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#3b82f6"
              stroke="white"
              strokeWidth="2"
            />
            <text
              x={point.x}
              y={point.y - 10}
              textAnchor="middle"
              fontSize="10"
              fill="#374151"
            >
              {point.score}
            </text>
          </g>
        ))}

        {/* Score labels on rings */}
        <text
          x={centerX + maxRadius * 0.2}
          y={centerY + 4}
          textAnchor="middle"
          fontSize="10"
          fill="#6b7280"
        >
          10
        </text>
        <text
          x={centerX + maxRadius * 0.4}
          y={centerY + 4}
          textAnchor="middle"
          fontSize="10"
          fill="#6b7280"
        >
          8
        </text>
        <text
          x={centerX + maxRadius * 0.6}
          y={centerY + 4}
          textAnchor="middle"
          fontSize="10"
          fill="#6b7280"
        >
          6
        </text>
        <text
          x={centerX + maxRadius * 0.8}
          y={centerY + 4}
          textAnchor="middle"
          fontSize="10"
          fill="#6b7280"
        >
          4
        </text>
        <text
          x={centerX + maxRadius * 1.0}
          y={centerY + 4}
          textAnchor="middle"
          fontSize="10"
          fill="#6b7280"
        >
          0
        </text>
      </svg>
    </div>
  );
}

// Simple distribution chart
interface DistributionChartProps {
  data: { label: string; value: number; color?: string }[];
  width?: number;
  height?: number;
}

export function DistributionChart({
  data,
  width = 400,
  height = 200,
}: DistributionChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const padding = 40;
    const barWidth = (width - padding * 2) / data.length;
    const maxValue = Math.max(...data.map((d) => d.value));
    const chartHeight = height - padding * 2;

    const bars = data.map((item, index) => {
      const barHeight = (item.value / maxValue) * chartHeight;
      const x = padding + index * barWidth;
      const y = padding + chartHeight - barHeight;

      return {
        x,
        y,
        width: barWidth * 0.8,
        height: barHeight,
        value: item.value,
        label: item.label,
        color: item.color || "#3b82f6",
      };
    });

    return { padding, barWidth, maxValue, chartHeight, bars };
  }, [data, width, height]);

  if (!chartData) {
    return (
      <div
        className="flex items-center justify-center text-gray-500"
        style={{ width, height }}
      >
        Aucune donnée à afficher
      </div>
    );
  }

  const { padding, chartHeight, bars } = chartData;

  return (
    <div className="w-full h-full">
      <svg width={width} height={height} className="border rounded">
        {/* Y-axis */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={padding + chartHeight}
          stroke="#6b7280"
          strokeWidth="1"
        />

        {/* X-axis */}
        <line
          x1={padding}
          y1={padding + chartHeight}
          x2={width - padding}
          y2={padding + chartHeight}
          stroke="#6b7280"
          strokeWidth="1"
        />

        {/* Bars */}
        {bars.map((bar, index) => (
          <g key={index}>
            <rect
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              fill={bar.color}
              rx="2"
            />
            <text
              x={bar.x + bar.width / 2}
              y={bar.y - 5}
              textAnchor="middle"
              fontSize="10"
              fill="#374151"
            >
              {bar.value}
            </text>
            <text
              x={bar.x + bar.width / 2}
              y={padding + chartHeight + 15}
              textAnchor="middle"
              fontSize="12"
              fill="#6b7280"
            >
              {bar.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// Alias pour compatibilité
export const SimpleBarChart = DistributionChart;

// Exports par défaut
export { SimpleLineChart as default };
