# Vue Nuxt CockroachDB Starter

A modern full-stack starter template for building scalable web applications with authentication and a distributed SQL database.

## 🚀 Quick Start

This template provides a production-ready foundation with:
- **Frontend**: Vue 3 + Nuxt 3 (SSR-ready)
- **Authentication**: Google OAuth with session management
- **Database**: CockroachDB (distributed SQL, PostgreSQL-compatible)
- **Styling**: Tailwind CSS for rapid UI development
- **Type Safety**: Full TypeScript support
- **Developer Experience**: Hot reload, auto-imports, and file-based routing

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

```
├── pages/          # File-based routing
├── server/         # Backend API and utilities
│   └── api/        # API endpoints (public/ and protected)
├── components/     # Reusable Vue components
├── stores/         # Pinia state management
├── types/          # Shared TypeScript types
├── migrations/     # Database schema versioning
└── middleware/     # Route guards and auth

## Features

- **Authentication**: Google OAuth with automatic token verification
- **Database**: CockroachDB with custom migration system
- **State Management**: Pinia with persistence across sessions
- **Styling**: Tailwind CSS with Lucide icons
- **Type Safety**: Shared TypeScript types across client and server
- **API**: RESTful endpoints with built-in auth protection

## 🤔 Why This Stack?

- **CockroachDB**: Distributed SQL that scales horizontally while staying PostgreSQL-compatible
- **Nuxt 3**: Modern Vue framework with SSR, auto-imports, and excellent developer experience
- **Google OAuth**: Secure, widely-adopted authentication that users trust
- **TypeScript**: Catch errors at build time and improve developer productivity
- **File-based routing**: Intuitive project organization that scales with your application

## 🚀 Deployment

This template is designed to deploy easily to modern platforms:

- **Vercel**: Zero-config deployment with automatic HTTPS

For production, ensure you:
1. Set environment variables in your hosting platform
2. Run migrations against your production database
3. Configure your OAuth redirect URLs for your domain

## 📚 Documentation

For development guidance, see the project's CLAUDE.md files:
- Development patterns and best practices
- API endpoint creation and database operations
- Migration system details

## 🛠️ Troubleshooting

**HTTPS Certificate Issues**: If `mkcert localhost` fails, install mkcert first:
```bash
# macOS
brew install mkcert
# Other platforms: see https://github.com/FiloSottile/mkcert#installation
```

**Database Connection**: Ensure your CockroachDB cluster is active and the connection string includes the correct database name.

**OAuth Errors**: Verify your Google OAuth client ID and that localhost:3000 is in your authorized origins.

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
