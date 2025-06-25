import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const players = await prisma.player.findMany({
      include: {
        scores: true,
        sessions: {
          include: {
            scores: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // Calculer les statistiques pour chaque joueur
    const playersWithStats = players.map(player => {
      const totalScore = player.scores.reduce((sum, score) => sum + score.value, 0)
      const shotCount = player.scores.length
      const averageScore = shotCount > 0 ? totalScore / shotCount : 0
      
      return {
        id: player.id,
        name: player.name,
        totalScore,
        averageScore: Number(averageScore.toFixed(2)),
        shotCount,
        scores: player.scores.map(score => score.value),
        totalShots: 10, // Par défaut
        createdAt: player.createdAt,
        updatedAt: player.updatedAt
      }
    })
    
    return NextResponse.json(playersWithStats)
  } catch (error) {
    console.error('Erreur lors de la récupération des joueurs:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des joueurs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()
    
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Le nom du joueur est requis' },
        { status: 400 }
      )
    }
    
    const player = await prisma.player.create({
      data: {
        name: name.trim()
      }
    })
    
    // Retourner le joueur avec les statistiques par défaut
    const playerWithStats = {
      id: player.id,
      name: player.name,
      totalScore: 0,
      averageScore: 0,
      shotCount: 0,
      scores: [],
      totalShots: 10,
      createdAt: player.createdAt,
      updatedAt: player.updatedAt
    }
    
    return NextResponse.json(playerWithStats, { status: 201 })
  } catch (error: any) {
    console.error('Erreur lors de la création du joueur:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Un joueur avec ce nom existe déjà' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création du joueur' },
      { status: 500 }
    )
  }
}
