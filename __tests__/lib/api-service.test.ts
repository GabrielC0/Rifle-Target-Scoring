/**
 * Tests pour le service API
 */

import { apiService } from "@/lib/api-service";

describe("ApiService", () => {
  // Mock fetch local à ce test
  const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;

  beforeAll(() => {
    global.fetch = mockFetch;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getPlayers", () => {
    it("devrait récupérer la liste des joueurs", async () => {
      const mockPlayers = [
        {
          id: "1",
          name: "Jean Dupont",
          totalScore: 85.5,
          averageScore: 8.55,
          shotCount: 10,
          scores: [8.5, 9.2, 7.8, 9.0, 8.1, 8.7, 9.3, 8.9, 8.2, 9.8],
          totalShots: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlayers,
      } as Response);

      const result = await apiService.getPlayers();

      expect(mockFetch).toHaveBeenCalledWith("/api/players");
      expect(result).toEqual(mockPlayers);
    });

    it("devrait gérer les erreurs de récupération", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      await expect(apiService.getPlayers()).rejects.toThrow(
        "Erreur lors de la récupération des joueurs"
      );
    });
  });

  describe("createPlayer", () => {
    it("devrait créer un nouveau joueur", async () => {
      const mockPlayer = {
        id: "1",
        name: "Jean Dupont",
        totalScore: 0,
        averageScore: 0,
        shotCount: 0,
        scores: [],
        totalShots: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlayer,
      } as Response);

      const result = await apiService.createPlayer("Jean Dupont");

      expect(mockFetch).toHaveBeenCalledWith("/api/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Jean Dupont" }),
      });
      expect(result).toEqual(mockPlayer);
    });
  });

  describe("addScore", () => {
    it("devrait ajouter un score", async () => {
      const mockScore = {
        id: "score-1",
        playerId: "1",
        shotNumber: 1,
        value: 9.2,
        timestamp: new Date(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockScore,
      } as Response);

      const result = await apiService.addScore("1", 9.2, 1);

      expect(mockFetch).toHaveBeenCalledWith("/api/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId: "1",
          score: 9.2,
          shotNumber: 1,
        }),
      });
      expect(result).toEqual(mockScore);
    });
  });

  describe("checkHealth", () => {
    it("devrait vérifier la santé de l'API", async () => {
      const mockHealth = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: "connected",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockHealth,
      } as Response);

      const result = await apiService.checkHealth();

      expect(mockFetch).toHaveBeenCalledWith("/api/health");
      expect(result).toEqual(mockHealth);
    });
  });
});
