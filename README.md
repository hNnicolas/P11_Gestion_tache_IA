# Projet Next.js – Gestion de tâches avec commentaires

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).  
It includes a task management system, project management, and a commenting feature with user authentication.

---

## Description

This project allows users to:

- Create and manage projects.
- Create tasks inside projects.
- Add, update, and delete comments on tasks.
- Authenticate users with JWT tokens.
- Handle user permissions to control access to projects and tasks.

### Features

- User authentication (JWT-based)
- Project access control and permissions
- Real-time comment creation, modification, and deletion
- Task and project management
- TailwindCSS styling
- Integration with Mistral API (via `@mistralai/mistralai`)

---

## Prerequisites

- Node.js >= 18
- npm / yarn / pnpm / bun
- PostgreSQL (if Prisma uses a database)
- `.env.local` file configured

---

## Setup

1. **Cloner le repository:**

```bash
git clone "https://github.com/hNnicolas/P11_Gestion_tache_IA"
cd frontend
```

2. **Installer les dépendances**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Configurer les variables d'environnement**
   Créez un fichier .env.local à la racine du projet (vous pouvez copier depuis .env.example) et remplissez vos propres valeurs :

```bash
# URL du backend (ex: http://localhost:5000)
BACKEND_URL=

# URL publique de l'API (ex: http://localhost:5000/api)
NEXT_PUBLIC_API_URL=

# Clé secrète pour JWT
JWT_SECRET=

# Clé API Mistral
MISTRAL_API_KEY=

```

4. **Initialiser la base de données (si Prisma est utilisé)**

```bash
npx prisma migrate dev
npx prisma generate
```

5. **Lancer le serveur de développement**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
