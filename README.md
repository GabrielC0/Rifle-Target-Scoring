"# 🎯 Système de Score de Tir à la Carabine

Une application web moderne et intuitive pour le suivi et l'analyse des performances de tir à la carabine. Développée avec Next.js, React et TypeScript, cette application offre une interface responsive et des animations fluides pour gérer les sessions de tir et analyser les résultats.

## 🌐 Démo en Ligne

L'application est hébergée sur Vercel : **https://v0-shootinggrid.vercel.app/**

## ✨ Fonctionnalités Principales

### 📊 Gestion des Tireurs

- **Ajout/suppression de tireurs** avec nombre de tirs personnalisable
- **Profils individuels** avec statistiques détaillées
- **Suivi en temps réel** du tireur actuel et de sa progression

### 🎯 Saisie de Scores

- **Interface intuitive** avec boutons de saisie rapide (0-10 points)
- **Saisie manuelle** pour des scores précis (décimales acceptées)
- **Validation automatique** et feedback visuel
- **Animations de célébration** pour les bons scores

### 📈 Analyses et Statistiques

- **Graphiques en temps réel** de l'évolution des scores
- **Statistiques complètes** : moyenne, meilleur/pire tir, régularité
- **Analyse de consistance** avec écart-type
- **Historique complet** des sessions de tir

### 🏆 Classements et Comparaisons

- **Classement global automatique** avec podium
- **Comparaison multi-joueurs illimitée** avec code couleur
- **Mode comparaison** : tireur actuel vs meilleur tireur
- **Analyse tir par tir** entre participants

### 📱 Interface Responsive

- **Design adaptatif** pour tous les écrans (mobile, tablette, desktop)
- **Animations GSAP fluides** et feedback visuel
- **Thème moderne** avec Tailwind CSS et shadcn/ui
- **Navigation intuitive** entre les différentes sections

## 🛠 Technologies Utilisées

### Frontend

- **Next.js 15.2.4** - Framework React avec App Router
- **React 19** - Bibliothèque UI avec hooks modernes
- **TypeScript** - Typage statique pour plus de robustesse
- **Tailwind CSS** - Framework CSS utilitaire
- **shadcn/ui** - Composants UI modernes et accessibles

### Animations & Visualisation

- **GSAP** - Animations fluides et performantes
- **Recharts** - Graphiques interactifs et responsives
- **Lucide React** - Icônes modernes et cohérentes

### Gestion d'État

- **React Context** - Gestion centralisée de l'état
- **useReducer** - Actions complexes et prévisibles
- **LocalStorage** - Persistance automatique des données

### Développement

- **pnpm** - Gestionnaire de paquets rapide
- **ESLint** - Linting du code
- **PostCSS** - Traitement CSS avancé

## 🚀 Installation et Développement

### Prérequis

- Node.js 18+
- pnpm (recommandé) ou npm

### Installation

```bash
# Cloner le repository
git clone <repository-url>
cd rifle-target-scoring

# Installer les dépendances
pnpm install

# Lancer en mode développement
pnpm dev
```

### Scripts Disponibles

```bash
pnpm dev      # Serveur de développement
pnpm build    # Build de production
pnpm start    # Serveur de production
pnpm lint     # Vérification du code
```

L'application sera accessible sur `http://localhost:3000`

## 📋 Guide d'Utilisation

### 1. Gestion des Tireurs

1. Accédez à l'onglet **"👥 Gestion des Tireurs"**
2. Ajoutez un nouveau tireur avec son nom et le nombre de tirs souhaité
3. Sélectionnez le tireur actuel pour commencer à scorer

### 2. Session de Tir

1. Cliquez sur **"Commencer à Tirer"** pour un tireur
2. Utilisez les boutons rapides (0-10) ou la saisie manuelle
3. Suivez la progression en temps réel avec les graphiques
4. Consultez les statistiques actuelles dans le panneau de droite

### 3. Analyse des Résultats

1. Accédez aux **"Résultats Détaillés"** depuis la session de tir
2. Consultez l'analyse complète avec graphiques et conseils
3. Comparez les performances avec d'autres tireurs

### 4. Classement Global

1. Onglet **"🏆 Classement Global"** pour voir tous les tireurs
2. Sélectionnez plusieurs tireurs pour comparaison détaillée
3. Analysez les tendances avec les graphiques comparatifs

## 🎨 Caractéristiques Techniques

### Architecture

- **App Router Next.js** pour un routing moderne
- **Composants React réutilisables** avec TypeScript
- **Context API** pour la gestion d'état globale
- **Persistance automatique** avec localStorage

### Performance

- **Optimisations Next.js** (SSG, code splitting)
- **Animations GSAP optimisées** avec GPU
- **Bundle size optimisé** avec tree-shaking
- **Images optimisées** et lazy loading

### Accessibilité

- **Composants shadcn/ui accessibles** (ARIA, keyboard navigation)
- **Contrastes optimisés** pour la lisibilité
- **Support complet clavier** et lecteurs d'écran
- **Responsive design** pour tous les appareils

## 🎯 Fonctionnalités Avancées

### Système de Scoring

- **Validation en temps réel** des scores (0-10)
- **Support des décimales** pour plus de précision
- **Animations contextuelles** selon la performance
- **Feedback visuel immédiat** pour chaque tir

### Analyses Statistiques

- **Calcul automatique** de la moyenne mobile
- **Analyse de consistance** avec écart-type
- **Détection des tendances** (amélioration/dégradation)
- **Recommandations personnalisées** selon les performances

### Mode Comparaison

- **Comparaison illimitée** de tireurs simultanément
- **Code couleur dynamique** pour différenciation
- **Graphiques superposés** pour analyse visuelle
- **Classement en temps réel** de la sélection

## 📊 Métriques et Analyses

L'application calcule automatiquement :

- **Score total** et progression
- **Moyenne générale** et par session
- **Meilleur/pire tir** avec historique
- **Consistance** (écart-type)
- **Pourcentage de completion**
- **Tendances** sur les derniers tirs

## 🔄 Persistance des Données

- **Sauvegarde automatique** dans le localStorage
- **Récupération transparente** au rechargement
- **Gestion des erreurs** de parsing
- **Reset sélectif** par tireur ou global

## 🎉 Animations et UX

- **Animations d'entrée** fluides pour chaque page
- **Feedback visuel** pour toutes les interactions
- **Transitions contextuelles** selon les performances
- **Hover effects** et micro-interactions
- **Loading states** et skeleton screens

## 📱 Responsive Design

Optimisé pour :

- **📱 Mobile** (320px+) - Interface tactile optimisée
- **📱 Tablette** (768px+) - Mise en page hybride
- **💻 Desktop** (1024px+) - Interface complète
- **🖥 Large screens** (1440px+) - Utilisation optimale de l'espace

## 🔧 Configuration et Personnalisation

### Thème et Couleurs

Le système utilise des variables CSS personnalisables dans `app/globals.css` et `tailwind.config.ts`

### Composants UI

Basés sur shadcn/ui, facilement personnalisables via `components.json`

### Animations

Configurables dans les composants individuels avec GSAP

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou soumettre une pull request.

---

**Développé avec ❤️ pour la communauté du tir sportif**

Application hébergée sur Vercel : **https://v0-shootinggrid.vercel.app/**"
