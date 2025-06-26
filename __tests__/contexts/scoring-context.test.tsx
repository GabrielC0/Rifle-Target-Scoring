/**
 * Tests d'intégration pour le contexte de scoring
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ScoringProvider, useScoring } from "@/contexts/scoring-context";
import { apiService } from "@/lib/api-service";

// Mock de l'api-service
jest.mock("@/lib/api-service", () => ({
  apiService: {
    getPlayers: jest.fn(),
    createPlayer: jest.fn(),
    deletePlayer: jest.fn(),
    addScore: jest.fn(),
  },
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Composant de test pour accéder au contexte
function TestComponent() {
  const { state, addPlayerAsync, removePlayerAsync, addScoreAsync } =
    useScoring();

  return (
    <div>
      <div data-testid="loading">{state.isLoading ? "Loading" : "Ready"}</div>
      <div data-testid="error">{state.error || "No error"}</div>
      <div data-testid="players-count">{state.players.length}</div>

      {state.players.map((player) => (
        <div key={player.id} data-testid={`player-${player.id}`}>
          <span>{player.name}</span>
          <span data-testid={`score-${player.id}`}>{player.totalScore}</span>
          <span data-testid={`shots-${player.id}`}>
            {player.currentShot}/{player.totalShots}
          </span>
        </div>
      ))}

      <button
        onClick={() => addPlayerAsync("Test Player", 10)}
        data-testid="add-player"
      >
        Add Player
      </button>

      <button
        onClick={() =>
          state.players.length > 0 && removePlayerAsync(state.players[0].id)
        }
        data-testid="remove-player"
      >
        Remove Player
      </button>

      <button
        onClick={() =>
          state.players.length > 0 && addScoreAsync(state.players[0].id, 9.5)
        }
        data-testid="add-score"
      >
        Add Score
      </button>
    </div>
  );
}

describe("ScoringContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("devrait charger les joueurs au montage", async () => {
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

    mockApiService.getPlayers.mockResolvedValue(mockPlayers);

    render(
      <ScoringProvider>
        <TestComponent />
      </ScoringProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("Ready");
    });

    expect(screen.getByTestId("players-count")).toHaveTextContent("1");
    expect(screen.getByTestId("player-1")).toHaveTextContent("Jean Dupont");
    expect(screen.getByTestId("score-1")).toHaveTextContent("85.5");
  });

  it("devrait ajouter un nouveau joueur", async () => {
    const mockNewPlayer = {
      id: "2",
      name: "Test Player",
      totalScore: 0,
      averageScore: 0,
      shotCount: 0,
      scores: [],
      totalShots: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockApiService.getPlayers
      .mockResolvedValueOnce([]) // Chargement initial
      .mockResolvedValueOnce([mockNewPlayer]); // Après ajout

    mockApiService.createPlayer.mockResolvedValue(mockNewPlayer);

    render(
      <ScoringProvider>
        <TestComponent />
      </ScoringProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("Ready");
    });

    fireEvent.click(screen.getByTestId("add-player"));

    await waitFor(() => {
      expect(mockApiService.createPlayer).toHaveBeenCalledWith("Test Player");
    });
  });

  it("devrait ajouter un score", async () => {
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

    const mockScore = {
      id: "score-1",
      playerId: "1",
      shotNumber: 1,
      value: 9.5,
      timestamp: new Date(),
    };

    mockApiService.getPlayers.mockResolvedValue([mockPlayer]);
    mockApiService.addScore.mockResolvedValue(mockScore);

    render(
      <ScoringProvider>
        <TestComponent />
      </ScoringProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("Ready");
    });

    fireEvent.click(screen.getByTestId("add-score"));

    await waitFor(() => {
      expect(mockApiService.addScore).toHaveBeenCalledWith("1", 9.5, 1);
    });
  });

  it("devrait gérer les erreurs", async () => {
    // Supprimer temporairement les logs de console pour ce test
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockApiService.getPlayers.mockRejectedValue(new Error("API Error"));

    render(
      <ScoringProvider>
        <TestComponent />
      </ScoringProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent(
        "Erreur lors du chargement des joueurs"
      );
    });

    // Restaurer les logs de console
    consoleSpy.mockRestore();
  });
});
