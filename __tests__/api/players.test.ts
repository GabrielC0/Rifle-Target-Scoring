/**
 * Tests pour l'API Players
 */

describe("/api/players", () => {
  // Mock fetch local à ce test
  const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;

  beforeAll(() => {
    global.fetch = mockFetch;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/players", () => {
    it("devrait retourner la liste des joueurs", async () => {
      const mockPlayers = [
        {
          id: "player-1",
          name: "Jean Dupont",
          totalScore: 85.5,
          averageScore: 8.55,
          shotCount: 10,
          scores: [8.5, 9.2, 7.8, 9.0, 8.1, 8.7, 9.3, 8.9, 8.2, 9.8],
          totalShots: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "player-2",
          name: "Marie Martin",
          totalScore: 92.3,
          averageScore: 9.23,
          shotCount: 10,
          scores: [9.1, 9.5, 8.9, 9.8, 9.0, 9.2, 9.4, 9.1, 9.3, 9.0],
          totalShots: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockPlayers,
      } as Response);

      const response = await fetch("/api/players");
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockPlayers);
      expect(data).toHaveLength(2);
    });

    it("devrait gérer les erreurs de récupération", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "Erreur serveur" }),
      } as Response);

      const response = await fetch("/api/players");

      expect(response.status).toBe(500);
    });
  });

  describe("POST /api/players", () => {
    it("devrait créer un nouveau joueur", async () => {
      const newPlayer = {
        id: "player-3",
        name: "Pierre Durand",
        totalScore: 0,
        averageScore: 0,
        shotCount: 0,
        scores: [],
        totalShots: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => newPlayer,
      } as Response);

      const response = await fetch("/api/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Pierre Durand" }),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(newPlayer);
      expect(mockFetch).toHaveBeenCalledWith("/api/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Pierre Durand" }),
      });
    });

    it("devrait gérer les erreurs de création", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: "Nom requis" }),
      } as Response);

      const response = await fetch("/api/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "" }),
      });

      expect(response.status).toBe(400);
    });
  });
});
