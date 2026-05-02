# AgroTransform

Application web de gestion des transformations agroalimentaires (ex: mil → couscous).

## 🛠️ Stack Technique

- **Frontend :** React + Vite + TypeScript + TailwindCSS
- **Backend :** Node.js + Express + TypeScript
- **Base de données :** PostgreSQL
- **ORM :** Prisma 5.22
- **Authentification :** JWT + bcrypt

## 📋 Prérequis

- Node.js >= 18
- PostgreSQL >= 14
- npm ou yarn

## 🚀 Installation

### 1. Backend

```bash
cd agro-transform/backend
npm install

# Copier .env.example vers .env et configurer la base de données
cp .env.example .env

# Lancer les migrations
npx prisma migrate dev
npx prisma generate

# Démarrer le serveur
npm run dev
```

### 2. Frontend

```bash
cd agro-transform/frontend
npm install
npm run dev
```

## 🔧 Variables d'environnement

### Backend (.env)

```
DATABASE_URL="postgresql://user:password@localhost:5432/agrotransform"
JWT_SECRET="votre-secret-jwt"
PORT=5000
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:5000/api
```

## 📊 Fonctionnalités

### Authentification
- Inscription avec hachage de mot de passe
- Connexion avec JWT
- 4 rôles (ADMIN, TRANSFORMATEUR, FORMATEUR, OBSERVATEUR)
- Middleware d'authentification et d'autorisation

### Gestion des matières premières
- CRUD complet
- Gestion des stocks (minimum, maximum)
- Alertes stocks bas

### Gestion des produits finis
- CRUD complet
- Suivi de la production

### Recettes de transformation
- Création de recettes avec étapes
- Calcul automatique du rendement théorique
- Lancement de transformations

### Transformations
- Historique des transformations
- Calcul du rendement réel et des pertes
- Statistiques de production

## 🌐 Routes API

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Matières premières
- `GET /api/matieres-premieres` - Lister
- `POST /api/matieres-premieres` - Créer
- `PUT /api/matieres-premieres/:id` - Modifier
- `DELETE /api/matieres-premieres/:id` - Supprimer

### Produits finis
- `GET /api/produits-finis` - Lister
- `POST /api/produits-finis` - Créer
- `PUT /api/produits-finis/:id` - Modifier
- `DELETE /api/produits-finis/:id` - Supprimer

### Recettes
- `GET /api/recettes` - Lister
- `POST /api/recettes` - Créer
- `GET /api/recettes/:id` - Détail
- `PUT /api/recettes/:id` - Modifier
- `DELETE /api/recettes/:id` - Supprimer
- `POST /api/recettes/:id/transformer` - Lancer transformation

### Transformations
- `GET /api/transformations` - Historique
- `POST /api/transformations` - Créer
- `GET /api/transformations/stats/production` - Stats production
- `GET /api/transformations/stats/rendements` - Stats rendements

## 👥 Rôles utilisateurs

- **ADMIN** : Accès complet à toutes les fonctionnalités
- **TRANSFORMATEUR** : Création et gestion des transformations
- **FORMATEUR** : Création de recettes et formations
- **OBSERVATEUR** : Lecture seule

## 📈 État d'avancement

- [x] Phase 1 : Initialisation du projet
- [x] Phase 2 : Authentification
- [x] Phase 3 : API de base (Matières premières, Produits finis, Recettes, Transformations)
- [x] Phase 4 : Frontend (Dashboard, Pages de gestion)
- [ ] Phase 5 : Tests et validation
- [ ] Phase 6 : Documentation et déploiement

## 🚀 Démarrage rapide

1. Lancer le backend : `cd backend && npm run dev`
2. Lancer le frontend : `cd frontend && npm run dev`
3. Accéder à l'application : http://localhost:3001

## 📝 Notes

- Le backend tourne sur le port 5000
- Le frontend tourne sur le port 3001
- La base de données PostgreSQL doit être configurée localement

## 🤝 Contribution

1. Fork le projet
2. Créer une branche pour la fonctionnalité
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 License

ISC
