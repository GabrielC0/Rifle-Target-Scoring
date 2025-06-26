// Service pour interagir avec l'API de la base de données

export interface Player {
  id: string;
  name: string;
  totalScore: number;
  averageScore: number;
  shotCount: number;
  scores: number[];
  totalShots: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Score {
  id: string;
  playerId: string;
  shotNumber: number;
  value: number;
  x?: number;
  y?: number;
  precision?: number;
  ring?: number;
  timestamp: Date;
}

export interface HealthCheck {
  status: string;
  timestamp: string;
  database: string;
}

class ApiService {
  private baseUrl = "/api";

  // Players API
  async getPlayers(): Promise<Player[]> {
    const response = await fetch(`${this.baseUrl}/players`);
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des joueurs");
    }
    return response.json();
  }

  async getPlayer(playerId: string): Promise<Player> {
    const response = await fetch(`${this.baseUrl}/players/${playerId}`);
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération du joueur");
    }
    return response.json();
  }

  async createPlayer(name: string): Promise<Player> {
    const response = await fetch(`${this.baseUrl}/players`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erreur lors de la création du joueur");
    }

    return response.json();
  }

  async updatePlayer(playerId: string, data: Partial<Player>): Promise<Player> {
    const response = await fetch(`${this.baseUrl}/players/${playerId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour du joueur");
    }

    return response.json();
  }

  async deletePlayer(playerId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/players/${playerId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la suppression du joueur");
    }
  }

  // Scores API
  async addScore(
    playerId: string,
    score: number,
    shotNumber: number,
    coordinates?: { x: number; y: number }
  ): Promise<Score> {
    const payload: any = {
      playerId,
      score,
      shotNumber,
    };

    if (coordinates) {
      payload.x = coordinates.x;
      payload.y = coordinates.y;
    }

    const response = await fetch(`${this.baseUrl}/scores`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de l'ajout du score");
    }

    return response.json();
  }

  async getScores(playerId?: string): Promise<Score[]> {
    const url = playerId
      ? `${this.baseUrl}/scores?playerId=${playerId}`
      : `${this.baseUrl}/scores`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des scores");
    }
    return response.json();
  }

  // Health check
  async checkHealth(): Promise<HealthCheck> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) {
      throw new Error("Erreur lors de la vérification de l'état de l'API");
    }
    return response.json();
  }

  // Statistics
  async getStats(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/stats`);
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des statistiques");
    }
    return response.json();
  }
}

export const apiService = new ApiService();
