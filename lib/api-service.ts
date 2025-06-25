// Service pour interagir avec l'API de la base de données

export interface Player {
  id: string
  name: string
  totalScore: number
  averageScore: number
  shotCount: number
  scores: number[]
  totalShots: number
  createdAt: Date
  updatedAt: Date
}

export interface Score {
  id: string
  playerId: string
  shotNumber: number
  value: number
  x?: number
  y?: number
  precision?: number
  ring?: number
  timestamp: Date
}

class ApiService {
  private baseUrl = '/api'

  // Players API
  async getPlayers(): Promise<Player[]> {
    const response = await fetch(`${this.baseUrl}/players`)
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des joueurs')
    }
    return response.json()
  }

  async getPlayer(playerId: string): Promise<Player> {
    const response = await fetch(`${this.baseUrl}/players/${playerId}`)
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du joueur')
    }
    return response.json()
  }

  async createPlayer(name: string): Promise<Player> {
    const response = await fetch(`${this.baseUrl}/players`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erreur lors de la création du joueur')
    }
    
    return response.json()
  }

  async deletePlayer(playerId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/players/${playerId}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erreur lors de la suppression du joueur')
    }
  }

  // Scores API
  async addScore(
    playerId: string,
    score: number,
    shotNumber: number,
    x?: number,
    y?: number,
    ring?: number
  ): Promise<Score> {
    const response = await fetch(`${this.baseUrl}/scores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        playerId,
        score,
        shotNumber,
        x,
        y,
        ring,
      }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erreur lors de l\'ajout du score')
    }
    
    return response.json()
  }

  async resetPlayerScores(playerId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/scores`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerId }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erreur lors de la réinitialisation des scores')
    }
  }

  // Synchronisation avec localStorage
  async syncFromLocalStorage(): Promise<void> {
    try {
      const localData = localStorage.getItem('scoring-app-state')
      if (!localData) return

      const state = JSON.parse(localData)
      if (!state.players || !Array.isArray(state.players)) return

      // Migrer les joueurs depuis localStorage vers la base de données
      for (const localPlayer of state.players) {
        try {
          // Vérifier si le joueur existe déjà
          const existingPlayers = await this.getPlayers()
          const existingPlayer = existingPlayers.find(p => p.name === localPlayer.name)
          
          let playerId: string
          
          if (existingPlayer) {
            playerId = existingPlayer.id
          } else {
            // Créer le joueur
            const newPlayer = await this.createPlayer(localPlayer.name)
            playerId = newPlayer.id
          }
          
          // Ajouter les scores s'ils n'existent pas déjà
          if (localPlayer.scores && Array.isArray(localPlayer.scores)) {
            const currentPlayer = await this.getPlayer(playerId)
            
            // Ne migrer que si le joueur n'a pas encore de scores
            if (currentPlayer.scores.length === 0) {
              for (let i = 0; i < localPlayer.scores.length; i++) {
                await this.addScore(playerId, localPlayer.scores[i], i + 1)
              }
            }
          }
        } catch (error) {
          console.error(`Erreur lors de la migration du joueur ${localPlayer.name}:`, error)
        }
      }
      
      console.log('Migration depuis localStorage terminée')
    } catch (error) {
      console.error('Erreur lors de la synchronisation depuis localStorage:', error)
    }
  }
}

export const apiService = new ApiService()
