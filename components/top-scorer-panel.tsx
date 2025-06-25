"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useScoring } from "@/contexts/scoring-context";
import { SimpleLineChart } from "@/components/simple-charts";
import { Trophy } from "lucide-react";

export function TopScorerPanel() {
  const { state } = useScoring();

  const topScorer = state.players.find((p) => p.id === state.topScorerId);

  if (!topScorer || topScorer.scores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            Meilleur Tireur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8 text-sm">
            Aucun score enregistré
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data with cumulative scores
  const chartData = topScorer.scores.map((score, index) => {
    const cumulativeScore = topScorer.scores
      .slice(0, index + 1)
      .reduce((sum, s) => sum + s, 0);
    return {
      shot: index + 1,
      score: score,
      cumulative: cumulativeScore,
      average: cumulativeScore / (index + 1),
    };
  });

  const averageScore = topScorer.totalScore / topScorer.scores.length;
  const bestShot = Math.max(...topScorer.scores);
  const consistency =
    topScorer.scores.length > 1
      ? Math.sqrt(
          topScorer.scores.reduce(
            (sum, score) => sum + Math.pow(score - averageScore, 2),
            0
          ) / topScorer.scores.length
        )
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
          <span className="truncate">Meilleur: {topScorer.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-yellow-600">
              {topScorer.totalScore}
            </div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">
              {averageScore.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">Moyenne</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-green-600">
              {bestShot}
            </div>
            <div className="text-xs text-gray-500">Meilleur</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-purple-600">
              {consistency.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">Écart-T</div>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm text-gray-600">
            Progrès: {topScorer.currentShot}/{topScorer.totalShots}
          </span>
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 text-xs"
          >
            🏆 En tête
          </Badge>
        </div>

        {/* Chart */}
        <div className="h-48 sm:h-64">
          <SimpleLineChart
            data={chartData}
            lines={[
              {
                dataKey: "score",
                stroke: "#eab308",
                name: "Score Tir",
                strokeWidth: 2,
                dots: true,
              },
              {
                dataKey: "average",
                stroke: "#3b82f6",
                name: "Moyenne",
                strokeWidth: 1,
                strokeDasharray: "5,5",
                dots: false,
              },
            ]}
            xAxisKey="shot"
            xAxisLabel="N° Tir"
            yAxisLabel="Score"
            tooltipFormatter={(label: string) => `Tir ${label}`}
          />
        </div>

        {/* Recent Scores */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Tirs Récents:</div>
          <div className="flex flex-wrap gap-1">
            {topScorer.scores.slice(-8).map((score, index) => (
              <Badge
                key={index}
                variant="outline"
                className={`text-xs ${
                  score >= 9
                    ? "bg-green-100 text-green-800 border-green-300"
                    : score >= 7
                    ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                    : "bg-red-100 text-red-800 border-red-300"
                }`}
              >
                {score}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
