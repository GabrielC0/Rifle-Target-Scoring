# Tests d'Authentification

Ce dossier contient tous les tests pour le système d'authentification de l'application de tir à la carabine.

## Structure des Tests

### 📋 Tests d'Intégration (`auth-integration.test.ts`)

- Tests de l'API de login
- Validation des identifiants
- Gestion des erreurs
- Protection des routes

### 🔄 Tests End-to-End (`auth-e2e.test.ts`)

- Parcours utilisateur complet
- Navigation avec/sans authentification
- Tests de sécurité
- Gestion des cas limites

### 🛠️ Tests Utilitaires (`auth-utils.test.ts`)

- Génération et validation des tokens
- Classification des routes
- Validation des credentials
- Gestion des sessions

### 🧪 Tests d'API (`api/auth.test.ts`)

- Tests unitaires de l'endpoint `/api/auth/login`
- Validation des réponses
- Gestion des erreurs HTTP

### 🎭 Tests de Composants (`components/`)

- Tests du contexte d'authentification
- Tests des composants de protection des routes
- Tests des interactions utilisateur

## Lancement des Tests

```bash
# Tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:coverage

# Tests d'authentification uniquement
npm run test:auth

# Tests d'intégration
npm run test:integration

# Tests end-to-end
npm run test:e2e
```

## Couverture des Tests

Les tests couvrent les fonctionnalités suivantes :

### ✅ Authentification

- [x] Connexion avec identifiants valides (root/admin)
- [x] Rejet des identifiants invalides
- [x] Validation des champs requis
- [x] Génération de tokens d'authentification

### ✅ Protection des Routes

- [x] Accès libre à `/classement`
- [x] Protection des autres routes
- [x] Redirection vers `/classement` si non authentifié
- [x] Popup d'accès refusé

### ✅ Gestion des Sessions

- [x] Persistance dans localStorage
- [x] Vérification des tokens
- [x] Déconnexion et nettoyage
- [x] Gestion des états d'authentification

### ✅ Sécurité

- [x] Validation des tokens
- [x] Gestion des erreurs réseau
- [x] Protection contre les accès non autorisés
- [x] Gestion des cas limites

## Identifiants de Test

Pour les tests et l'utilisation de l'application :

- **Nom d'utilisateur :** `root`
- **Mot de passe :** `admin`

## Architecture de Sécurité

L'application utilise un système d'authentification simple mais efficace :

1. **Routes Publiques :** Seule `/classement` est accessible sans authentification
2. **Routes Protégées :** Toutes les autres routes nécessitent une authentification
3. **Tokens :** Générés côté serveur et stockés dans localStorage
4. **Redirection :** Les utilisateurs non authentifiés sont redirigés vers `/classement`
5. **Feedback :** Popup informatif pour les tentatives d'accès non autorisées

## Ajout de Nouveaux Tests

Pour ajouter de nouveaux tests :

1. Créer un fichier `.test.ts` ou `.test.tsx`
2. Suivre la convention de nommage existante
3. Utiliser les mocks appropriés
4. Documenter les cas de test
5. Mettre à jour ce README si nécessaire
