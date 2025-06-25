import { prisma } from './lib/prisma'

async function testDatabase() {
  try {
    console.log('🔄 Test de la connexion à la base de données...')
    
    // Test de création d'un joueur
    const testPlayer = await prisma.player.create({
      data: {
        name: `Test Player ${Date.now()}`
      }
    })
    console.log('✅ Joueur créé:', testPlayer)
    
    // Test d'ajout d'un score
    const testScore = await prisma.score.create({
      data: {
        playerId: testPlayer.id,
        shotNumber: 1,
        value: 9.5,
        precision: 95.0,
        ring: 10
      }
    })
    console.log('✅ Score ajouté:', testScore)
    
    // Test de récupération des données
    const players = await prisma.player.findMany({
      include: {
        scores: true
      }
    })
    console.log('✅ Joueurs récupérés:', players.length)
    
    // Nettoyage - supprimer le joueur de test
    await prisma.player.delete({
      where: { id: testPlayer.id }
    })
    console.log('✅ Nettoyage effectué')
    
    console.log('🎉 Base de données fonctionne parfaitement !')
    
  } catch (error) {
    console.error('❌ Erreur lors du test de la base de données:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()
