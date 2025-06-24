// Palette de couleurs pour les joueurs
export const PLAYER_COLORS = [
  { primary: "#3b82f6", secondary: "#dbeafe", name: "Bleu" }, // Blue
  { primary: "#10b981", secondary: "#d1fae5", name: "Vert" }, // Green
  { primary: "#f59e0b", secondary: "#fef3c7", name: "Orange" }, // Orange
  { primary: "#ef4444", secondary: "#fee2e2", name: "Rouge" }, // Red
  { primary: "#8b5cf6", secondary: "#ede9fe", name: "Violet" }, // Purple
  { primary: "#06b6d4", secondary: "#cffafe", name: "Cyan" }, // Cyan
  { primary: "#84cc16", secondary: "#ecfccb", name: "Lime" }, // Lime
  { primary: "#f97316", secondary: "#fed7aa", name: "Amber" }, // Amber
  { primary: "#ec4899", secondary: "#fce7f3", name: "Rose" }, // Rose
  { primary: "#6366f1", secondary: "#e0e7ff", name: "Indigo" }, // Indigo
  { primary: "#14b8a6", secondary: "#ccfbf1", name: "Teal" }, // Teal
  { primary: "#eab308", secondary: "#fef9c3", name: "Jaune" }, // Yellow
  { primary: "#dc2626", secondary: "#fecaca", name: "Rouge Foncé" }, // Dark Red
  { primary: "#7c3aed", secondary: "#f3e8ff", name: "Violet Foncé" }, // Dark Purple
  { primary: "#059669", secondary: "#a7f3d0", name: "Vert Foncé" }, // Dark Green
  { primary: "#d97706", secondary: "#fed7aa", name: "Orange Foncé" }, // Dark Orange
  { primary: "#be185d", secondary: "#fdf2f8", name: "Rose Foncé" }, // Dark Rose
  { primary: "#4338ca", secondary: "#e0e7ff", name: "Indigo Foncé" }, // Dark Indigo
  { primary: "#0891b2", secondary: "#cffafe", name: "Cyan Foncé" }, // Dark Cyan
  { primary: "#65a30d", secondary: "#ecfccb", name: "Lime Foncé" }, // Dark Lime
]

export function getPlayerColor(index: number) {
  return PLAYER_COLORS[index % PLAYER_COLORS.length]
}

export function getPlayerColorByIndex(players: any[], playerId: string) {
  const index = players.findIndex((p) => p.id === playerId)
  return getPlayerColor(index)
}
