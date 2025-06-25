"use client";

import { useMemo } from "react";

interface ChartData {
  shot?: number;
  score?: number;
  average?: number;
  cumulative?: number;
  count?: number;
}

interface SimpleLineChartProps {
  data: ChartData[];
  width?: number;
  height?: number;
}

export function SimpleLineChart({
  data,
  width = 400,
  height = 300,
}: SimpleLineChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxScore = Math.max(
      ...data.map((d) => Math.max(d.score || 0, d.average || 0))
    );
    const minScore = 0;
    const scoreRange = maxScore - minScore || 1;

    const points = data.map((point, index) => {
      const x = padding + (index / (data.length - 1 || 1)) * chartWidth;
      const yScore =
        padding +
        chartHeight -
        (((point.score || 0) - minScore) / scoreRange) * chartHeight;
      const yAverage =
        padding +
        chartHeight -
        (((point.average || 0) - minScore) / scoreRange) * chartHeight;

      return {
        x,
        yScore,
        yAverage,
        shot: point.shot,
        score: point.score,
        average: point.average,
      };
    });

    return { points, chartWidth, chartHeight, padding, maxScore, minScore };
  }, [data, width, height]);

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>Aucune donnée disponible</p>
      </div>
    );
  }

  const { points, chartWidth, chartHeight, padding, maxScore } = chartData;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        width={width}
        height={height}
        className="border border-gray-200 rounded"
      >
        {/* Grille */}
        <defs>
          <pattern
            id="grid"
            width="40"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 30"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Axes */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#6b7280"
          strokeWidth="2"
        />
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#6b7280"
          strokeWidth="2"
        />

        {/* Labels Y */}
        {[0, 2, 4, 6, 8, 10].map((score) => {
          const y = padding + chartHeight - (score / 10) * chartHeight;
          return (
            <g key={score}>
              <text
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#6b7280"
              >
                {score}
              </text>
              <line
                x1={padding - 5}
                y1={y}
                x2={padding}
                y2={y}
                stroke="#6b7280"
                strokeWidth="1"
              />
            </g>
          );
        })}

        {/* Labels X */}
        {points.map((point, index) => {
          if (index % Math.ceil(points.length / 8) === 0) {
            return (
              <text
                key={index}
                x={point.x}
                y={height - padding + 15}
                textAnchor="middle"
                fontSize="10"
                fill="#6b7280"
              >
                {point.shot}
              </text>
            );
          }
          return null;
        })}

        {/* Ligne des scores */}
        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          points={points.map((p) => `${p.x},${p.yScore}`).join(" ")}
        />

        {/* Ligne moyenne */}
        <polyline
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeDasharray="5,5"
          points={points.map((p) => `${p.x},${p.yAverage}`).join(" ")}
        />

        {/* Points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.yScore}
              r="4"
              fill="#3b82f6"
              stroke="white"
              strokeWidth="2"
            />
            <title>{`Tir ${point.shot}: ${point.score}`}</title>
          </g>
        ))}

        {/* Légende */}
        <g transform={`translate(${width - 150}, 20)`}>
          <rect
            x="0"
            y="0"
            width="140"
            height="50"
            fill="white"
            stroke="#e5e7eb"
            strokeWidth="1"
            rx="4"
          />
          <line
            x1="10"
            y1="15"
            x2="30"
            y2="15"
            stroke="#3b82f6"
            strokeWidth="2"
          />
          <circle cx="20" cy="15" r="3" fill="#3b82f6" />
          <text x="35" y="19" fontSize="12" fill="#374151">
            Score
          </text>

          <line
            x1="10"
            y1="35"
            x2="30"
            y2="35"
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="3,3"
          />
          <text x="35" y="39" fontSize="12" fill="#374151">
            Moyenne
          </text>
        </g>
      </svg>
    </div>
  );
}

interface SimpleBarChartProps {
  data: { score: string; count: number }[];
  width?: number;
  height?: number;
}

interface PrecisionChartProps {
  data: ChartData[];
  width?: number;
  height?: number;
}

export function PrecisionChart({
  data,
  width = 400,
  height = 300,
}: PrecisionChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const padding = 50;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Calculer le pourcentage de précision pour chaque tir
    // Score 10 = 100%, Score 9 = 90%, etc.
    const precisionPoints = data.map((point, index) => {
      const score = point.score || 0;
      const precision = (score / 10) * 100; // Convertir en pourcentage
      const x = padding + (index / (data.length - 1 || 1)) * chartWidth;
      const y = padding + chartHeight - (precision / 100) * chartHeight;

      return {
        x,
        y,
        precision,
        shot: point.shot,
        score: point.score,
      };
    });

    // Calculer la précision moyenne mobile (sur 3 tirs)
    const movingAveragePoints = data.map((_, index) => {
      const start = Math.max(0, index - 1);
      const end = Math.min(data.length, index + 2);
      const subset = data.slice(start, end);
      const avgScore =
        subset.reduce((sum, p) => sum + (p.score || 0), 0) / subset.length;
      const avgPrecision = (avgScore / 10) * 100;

      const x = padding + (index / (data.length - 1 || 1)) * chartWidth;
      const y = padding + chartHeight - (avgPrecision / 100) * chartHeight;

      return { x, y, precision: avgPrecision };
    });

    return {
      precisionPoints,
      movingAveragePoints,
      chartWidth,
      chartHeight,
      padding,
    };
  }, [data, width, height]);

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>Aucune donnée disponible</p>
      </div>
    );
  }

  const { precisionPoints, movingAveragePoints, chartHeight, padding } =
    chartData;

  // Zones de précision
  const zones = [
    { min: 90, max: 100, color: "#22c55e", label: "Excellent" },
    { min: 70, max: 90, color: "#eab308", label: "Bon" },
    { min: 50, max: 70, color: "#f97316", label: "Moyen" },
    { min: 0, max: 50, color: "#ef4444", label: "Faible" },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        width={width}
        height={height}
        className="border border-gray-200 rounded"
      >
        {/* Grille */}
        <defs>
          <pattern
            id="precisiongrid"
            width="40"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 30"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#precisiongrid)" />

        {/* Zones de précision (arrière-plan) */}
        {zones.map((zone, index) => {
          const yTop = padding + chartHeight - (zone.max / 100) * chartHeight;
          const yBottom =
            padding + chartHeight - (zone.min / 100) * chartHeight;
          return (
            <rect
              key={index}
              x={padding}
              y={yTop}
              width={width - padding * 2}
              height={yBottom - yTop}
              fill={zone.color}
              opacity="0.1"
            />
          );
        })}

        {/* Axes */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#6b7280"
          strokeWidth="2"
        />
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#6b7280"
          strokeWidth="2"
        />

        {/* Labels Y (pourcentages) */}
        {[0, 20, 40, 60, 80, 100].map((percent) => {
          const y = padding + chartHeight - (percent / 100) * chartHeight;
          return (
            <g key={percent}>
              <text
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#6b7280"
              >
                {percent}%
              </text>
              <line
                x1={padding - 5}
                y1={y}
                x2={padding}
                y2={y}
                stroke="#6b7280"
                strokeWidth="1"
              />
            </g>
          );
        })}

        {/* Labels X */}
        {precisionPoints.map((point, index) => {
          if (index % Math.ceil(precisionPoints.length / 8) === 0) {
            return (
              <text
                key={index}
                x={point.x}
                y={height - padding + 15}
                textAnchor="middle"
                fontSize="10"
                fill="#6b7280"
              >
                {point.shot}
              </text>
            );
          }
          return null;
        })}

        {/* Ligne de précision */}
        <polyline
          fill="none"
          stroke="#dc2626"
          strokeWidth="3"
          points={precisionPoints.map((p) => `${p.x},${p.y}`).join(" ")}
        />

        {/* Ligne de tendance (moyenne mobile) */}
        <polyline
          fill="none"
          stroke="#059669"
          strokeWidth="2"
          strokeDasharray="5,5"
          points={movingAveragePoints.map((p) => `${p.x},${p.y}`).join(" ")}
        />

        {/* Points de précision */}
        {precisionPoints.map((point, index) => {
          const zone = zones.find(
            (z) => point.precision >= z.min && point.precision <= z.max
          );
          return (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill={zone?.color || "#6b7280"}
                stroke="white"
                strokeWidth="2"
              />
              <title>{`Tir ${point.shot}: ${point.precision.toFixed(
                1
              )}% de précision (Score: ${point.score})`}</title>
            </g>
          );
        })}

        {/* Légende */}
        <g transform={`translate(${width - 160}, 20)`}>
          <rect
            x="0"
            y="0"
            width="150"
            height="80"
            fill="white"
            stroke="#e5e7eb"
            strokeWidth="1"
            rx="4"
          />

          <line
            x1="10"
            y1="15"
            x2="30"
            y2="15"
            stroke="#dc2626"
            strokeWidth="3"
          />
          <text x="35" y="19" fontSize="11" fill="#374151">
            Précision
          </text>

          <line
            x1="10"
            y1="30"
            x2="30"
            y2="30"
            stroke="#059669"
            strokeWidth="2"
            strokeDasharray="3,3"
          />
          <text x="35" y="34" fontSize="11" fill="#374151">
            Tendance
          </text>

          <text x="10" y="50" fontSize="10" fill="#6b7280" fontWeight="bold">
            Zones:
          </text>
          <circle cx="15" cy="60" r="3" fill="#22c55e" />
          <text x="25" y="64" fontSize="9" fill="#374151">
            Excellent
          </text>
          <circle cx="80" cy="60" r="3" fill="#eab308" />
          <text x="90" y="64" fontSize="9" fill="#374151">
            Bon
          </text>
          <circle cx="15" cy="73" r="3" fill="#f97316" />
          <text x="25" y="77" fontSize="9" fill="#374151">
            Moyen
          </text>
          <circle cx="80" cy="73" r="3" fill="#ef4444" />
          <text x="90" y="77" fontSize="9" fill="#374151">
            Faible
          </text>
        </g>
      </svg>
    </div>
  );
}

export function SimpleBarChart({
  data,
  width = 400,
  height = 300,
}: SimpleBarChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxCount = Math.max(...data.map((d) => d.count));
    const barWidth = (chartWidth / data.length) * 0.8;

    const bars = data.map((item, index) => {
      const x =
        padding +
        (index / data.length) * chartWidth +
        (chartWidth / data.length - barWidth) / 2;
      const barHeight = (item.count / (maxCount || 1)) * chartHeight;
      const y = padding + chartHeight - barHeight;

      return {
        x,
        y,
        width: barWidth,
        height: barHeight,
        score: item.score,
        count: item.count,
      };
    });

    return { bars, chartWidth, chartHeight, padding, maxCount };
  }, [data, width, height]);

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>Aucune donnée disponible</p>
      </div>
    );
  }

  const { bars, chartHeight, padding, maxCount } = chartData;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        width={width}
        height={height}
        className="border border-gray-200 rounded"
      >
        {/* Grille */}
        <defs>
          <pattern
            id="bargrid"
            width="40"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 30"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bargrid)" />

        {/* Axes */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#6b7280"
          strokeWidth="2"
        />
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#6b7280"
          strokeWidth="2"
        />

        {/* Labels Y */}
        {Array.from({ length: 6 }, (_, i) => {
          const count = Math.round((maxCount / 5) * i);
          const y =
            padding + chartHeight - (count / (maxCount || 1)) * chartHeight;
          return (
            <g key={i}>
              <text
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#6b7280"
              >
                {count}
              </text>
              <line
                x1={padding - 5}
                y1={y}
                x2={padding}
                y2={y}
                stroke="#6b7280"
                strokeWidth="1"
              />
            </g>
          );
        })}

        {/* Barres */}
        {bars.map((bar, index) => (
          <g key={index}>
            <rect
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              fill="#3b82f6"
              stroke="none"
              className="hover:fill-blue-700 transition-colors cursor-pointer"
            />
            <text
              x={bar.x + bar.width / 2}
              y={height - padding + 15}
              textAnchor="middle"
              fontSize="10"
              fill="#6b7280"
            >
              {bar.score}
            </text>
            <title>{`Score ${bar.score}: ${bar.count} tir${
              bar.count > 1 ? "s" : ""
            }`}</title>
          </g>
        ))}
      </svg>
    </div>
  );
}
