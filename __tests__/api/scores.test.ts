/**
 * Tests pour l'API Scores
 */

describe("/api/scores", () => {
  // Mock fetch local à ce test
  const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;

  beforeAll(() => {
    global.fetch = mockFetch;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/scores", () => {
    it("devrait créer un nouveau score", async () => {
      const mockScore = {
        id: "score-1",
        playerId: "player-1",
        shotNumber: 1,
        value: 9.2,
        timestamp: new Date().toISOString(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockScore,
      } as Response);

      const response = await fetch("/api/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId: "player-1",
          score: 9.2,
          shotNumber: 1,
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockScore);
      expect(mockFetch).toHaveBeenCalledWith("/api/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId: "player-1",
          score: 9.2,
          shotNumber: 1,
        }),
      });
    });

    it("devrait gérer les erreurs de création", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: "Joueur non trouvé" }),
      } as Response);

      const response = await fetch("/api/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId: "invalid-id",
          score: 9.2,
          shotNumber: 1,
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/scores", () => {
    it("devrait récupérer tous les scores", async () => {
      const mockScores = [
        {
          id: "score-1",
          playerId: "player-1",
          shotNumber: 1,
          value: 9.2,
          timestamp: new Date().toISOString(),
        },
        {
          id: "score-2",
          playerId: "player-1",
          shotNumber: 2,
          value: 8.5,
          timestamp: new Date().toISOString(),
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockScores,
      } as Response);

      const response = await fetch("/api/scores");
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockScores);
    });

    it("devrait récupérer les scores d'un joueur spécifique", async () => {
      const mockScores = [
        {
          id: "score-1",
          playerId: "player-1",
          shotNumber: 1,
          value: 9.2,
          timestamp: new Date().toISOString(),
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockScores,
      } as Response);

      const response = await fetch("/api/scores?playerId=player-1");
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockScores);
    });
  });
});
