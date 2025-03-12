# Vue Nuxt CockroachDB Starter

A starter template for building web applications with:
- Vue 3
- Nuxt 3
- CockroachDB
- Google OAuth Authentication
- Tailwind CSS

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. **Set up CockroachDB:**
   - Sign up or log in at [cockroachlabs.cloud](https://cockroachlabs.cloud/)
   - Create a new cluster (or use an existing one)
   - From the SQL console, create a new database:
     ```sql
     CREATE DATABASE starter;
     ```
   - Get your connection string from the "Connect" tab. It will look something like:
     ```
     postgresql://username:password@free-tier.gcp-us-central1.cockroachlabs.cloud:26257/starter?sslmode=verify-full
     ```

4. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

5. Configure your environment variables:
   - `NUXT_PUBLIC_GOOGLE_CLIENT_ID`: Google OAuth client ID (create one at Google Cloud Console)
   - `DATABASE_URL`: Your CockroachDB connection string from step 3

6. For local development with HTTPS (required for Google OAuth), generate certificates:
   ```bash
   mkcert localhost
   ```
   This will create `localhost.pem` and `localhost-key.pem` in the root directory.

7. Run the database migrations:
   ```bash
   npm run db:migrate
   ```

8. Start the development server:
   ```bash
   npm run dev
   ```

## Database Migrations

### Running Migrations
To apply all pending migrations:
```bash
npm run db:migrate
```

### Creating a New Migration
To create a new migration:
```bash
npm run db:create-migration your-migration-name
```

This creates a new migration file in the `migrations/sql` directory.

## Project Structure

- `assets/` - Static assets and CSS
- `components/` - Vue components
- `layouts/` - Page layouts
- `middleware/` - Route middleware
- `migrations/` - Database migrations
- `pages/` - Application pages and routes
- `public/` - Public static files
- `server/` - Server-side code
  - `api/` - API endpoints
  - `utils/` - Server utilities
- `stores/` - Pinia stores
- `types/` - TypeScript type definitions
- `utils/` - Utility functions

## Features

- **Authentication**: Google OAuth integration
- **Database**: CockroachDB with migration system
- **State Management**: Pinia with persistence
- **Styling**: Tailwind CSS with custom components
- **TypeScript**: Full TypeScript support
- **Routing**: Nuxt's file-based routing system

## Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Navigate to "APIs & Services" > "Credentials"
4. Create an OAuth client ID (Web application type)
5. Add authorized JavaScript origins:
   - `https://localhost:3000` (for local development)
6. Add authorized redirect URIs:
   - `https://localhost:3000` (for local development)
7. Copy the Client ID and use it as the `NUXT_PUBLIC_GOOGLE_CLIENT_ID` in your `.env` file
