# 📊 BRVM Investment Dashboard

Plateforme d'investissement en bourse pour la BRVM (Bourse Régionale des Valeurs Mobilières).

## 🚀 Technologies

- **Next.js 14** - Framework React
- **TypeScript** - Typage statique
- **TailwindCSS** - Styling
- **Zustand** - State management
- **Axios** - API client
- **Recharts** - Graphiques

## 📦 Installation
```bash
# Cloner le repo
git clone https://github.com/votre-username/brvm-web-dashboard.git

# Installer les dépendances
cd brvm-web-dashboard
npm install --legacy-peer-deps

# Configurer les variables d'environnement
cp .env.example .env.local

# Facultatif : renseigner `API_AUTH_TOKEN` si l'API distante nécessite un jeton
# serveur (ex: `Bearer xxxxxx`). Le proxy Next.js l'enverra pour les requêtes
# côté client sans exposer le secret.

# Lancer en développement
npm run dev
```

## 🌐 Déploiement

Le projet est configuré pour Vercel :
```bash
npm run build  # Test du build
git push       # Déploiement auto sur Vercel
```

## 📁 Structure

src/
├── app/         # Pages Next.js 14
├── components/  # Composants réutilisables
├── lib/         # Logique métier
└── types/       # Types TypeScript


## 🔗 API

Backend : https://brvm-api-xode.onrender.com/api/v1
