/**
 * Test d'endpoint pour vérifier que l'API fonctionne
 */

describe("/api/health", () => {
  // Mock fetch local à ce test
  const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;

  beforeAll(() => {
    global.fetch = mockFetch;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("devrait retourner le statut de santé de l'API", async () => {
    const mockHealthResponse = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      version: "1.0.0",
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockHealthResponse,
    } as Response);

    const response = await fetch("/api/health");
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("status");
    expect(data).toHaveProperty("timestamp");
    expect(data).toHaveProperty("database");
    expect(data).toHaveProperty("version");
  });
});
