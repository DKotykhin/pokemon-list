# Pokémon List

![Next.js](https://img.shields.io/badge/NextJS-16-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-latest-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat&logo=eslint&logoColor=white)

A web application for creating and managing custom Pokémon collections. Browse the full Pokédex, build lists within defined rules, download them as files, and reload saved files to recreate lists.

## Features

- Browse all Pokémon with infinite scroll (data from [PokéAPI](https://pokeapi.co))
- Create named lists with validation rules:
  - At least 3 Pokémon of different species
  - Total weight must not exceed 1300 hg
- View saved lists with sprites and per-Pokémon weight
- Download a list as a JSON file
- Upload a previously saved file to recreate a list
- Delete lists

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, server actions, server components)
- [PostgreSQL](https://www.postgresql.org) + [Prisma 7](https://www.prisma.io)
- [TanStack Query](https://tanstack.com/query) — infinite scroll
- [Tailwind CSS 4](https://tailwindcss.com)
- [PokéAPI](https://pokeapi.co/docs/v2#pokemon)

## Getting started

### Option A — Docker (app + database)

Runs the full stack in containers. No local Node.js or database setup required.

```bash
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000). The schema is applied automatically on startup.

---

### Option B — Local development

#### 1. Install dependencies

```bash
npm install
```

#### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pokemon-list"
NEXT_PUBLIC_POKEMON_API_URL="https://pokeapi.co/api/v2/pokemon"
```

#### 3. Start the database

```bash
docker compose up -d pokemon-db
```

#### 4. Push the schema to the database

```bash
npm run prisma:push
```

#### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture decisions

**Server components for data fetching**
The home page and list detail page are Next.js server components that query the database directly via Prisma, with no API route in between. This eliminates a round-trip and keeps data-fetching logic colocated with the UI that renders it. Both pages are marked `force-dynamic` so Next.js renders them at request time rather than attempting to pre-render against a database that may not be present at build time.

**Server actions for mutations**
Creating and deleting lists uses Next.js server actions instead of REST API routes. The action runs on the server, mutates the database, and calls `revalidatePath` to invalidate the cached page — no fetch call needed from the client and no separate API layer to maintain.

**TanStack Query only for the Pokémon grid**
React Query is used exclusively for the infinite-scroll catalogue because that data is paginated, client-driven, and benefits from caching between navigations. Everything else (list data, mutations) is handled by server components and server actions where React Query would add no value.

**Weight stored in hectograms as returned by PokéAPI**
PokéAPI's `weight` field is already in hectograms. Values are stored as-is in the database and compared directly against the 1300 hg rule, avoiding any conversion logic that could introduce off-by-one errors.

**`pokemonApiId` stored per list item**
Each saved `PokemonItem` records the PokéAPI numeric ID alongside the name and weight. This lets the detail page render sprites from the GitHub CDN without re-fetching the API, and lets the file upload flow re-fetch by ID rather than by name (more stable).

**JSON as the download/upload format**
Lists are exported as plain JSON with `listName` and a `pokemon` array. On upload the app re-fetches each Pokémon from PokéAPI by ID to get the current weight, so imported lists are always validated against live data before being saved.

**Cascade delete on the database relation**
`PokemonItem` rows carry a `CASCADE` delete constraint on the `list_id` foreign key. Deleting a `PokemonList` automatically removes all its items in a single database statement with no application-level cleanup needed.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run prisma:push` | Sync schema to database |
| `npm run prisma:migrate` | Create and run a migration |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:studio` | Open Prisma Studio |
