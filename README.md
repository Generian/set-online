# Set Online - Multiplayer Card Game

A real-time multiplayer implementation of the classic SET card game built with Next.js, Socket.io, and PostgreSQL.

## Features

- 🎮 Real-time multiplayer gameplay
- ⏱️ Time attack mode
- 🏆 High score tracking
- 💬 In-game chat
- 📱 Responsive design
- 🎯 Tutorial mode

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API routes, Socket.io
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: CSS Modules, Material-UI
- **Real-time**: Socket.io for live updates

## Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn package manager

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd set-online
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Variables Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
POSTGRES_PRISMA_URL="postgresql://username:password@localhost:5432/set_online?schema=public&pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NON_POOLING="postgresql://username:password@localhost:5432/set_online?schema=public"

# Optional: For production deployments
DATABASE_URL="postgresql://username:password@localhost:5432/set_online?schema=public"
```

**Important Notes:**

- Replace `username`, `password`, and `localhost:5432` with your actual PostgreSQL credentials
- The `POSTGRES_PRISMA_URL` uses connection pooling (recommended for production)
- The `POSTGRES_URL_NON_POOLING` is used for migrations and direct connections
- For local development, both URLs can point to the same database

### 4. Prisma Setup

#### Generate Prisma Client

```bash
npx prisma generate
```

This command creates the Prisma client based on your schema. **Run this command every time you modify the Prisma schema.**

#### Run Database Migrations

```bash
npx prisma db push
```

This command applies your schema changes to the database.

#### Optional: Seed the Database

```bash
npx prisma db seed
```

### 5. Start the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Schema

The application uses three main models:

- **User**: Stores user information and preferences
- **Game**: Tracks game sessions and data
- **Highscore**: Records player achievements and scores

## Common Issues and Solutions

### Prisma Client Not Initialized

If you encounter the error: `@prisma/client did not initialize yet. Please run "prisma generate"`

```bash
npx prisma generate
```

### Database Connection Issues

1. Verify your PostgreSQL server is running
2. Check your connection strings in `.env`
3. Ensure the database exists
4. Verify network connectivity (for remote databases)

### Environment Variables Not Loading

1. Ensure your `.env` file is in the root directory
2. Restart your development server after adding new variables
3. Check for typos in variable names

## Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Generate Prisma client
npx prisma generate

# Push schema changes to database
npx prisma db push

# View database in Prisma Studio
npx prisma studio
```

## Deployment

### Heroku Deployment

The project includes a `Procfile` for Heroku deployment:

```bash
# The heroku-postbuild script automatically runs:
# npx prisma generate && next build
```

### Environment Variables for Production

Set these environment variables in your hosting platform:

- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `NODE_ENV=production`

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── actions/           # Server actions
│   ├── game/              # Game components
│   ├── shared/            # Shared components
│   └── ...
├── helpers/               # Utility functions
├── prisma/                # Database schema and configuration
├── styles/                # CSS modules
└── pages/api/             # API routes
```
