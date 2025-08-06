### Running the Application
```bash
npm run dev
```
The application runs in HTTPS mode (required for Google OAuth) on https://localhost:3000. The SSL certificates (localhost.pem and localhost-key.pem) must be present in the root directory.

### Building for Production
```bash
npm run build    # Build for production
npm run preview  # Preview production build
npm run generate # Generate static site
```

### Database Management
```bash
npm run db:migrate                     # Run all pending migrations
npm run db:create-migration <name>     # Create a new migration file
```

For detailed information about the migration system, see [migrations/CLAUDE.md](migrations/CLAUDE.md).

## Architecture Overview

### Technology Stack
- **Frontend**: Vue 3 + Nuxt 3
- **Styling**: Tailwind CSS
- **Icons**: Lucide Vue Next icons
- **State Management**: Pinia with persistence
- **Authentication**: Google OAuth via nuxt-vue3-google-signin
- **Database**: CockroachDB (PostgreSQL-compatible)
- **Language**: TypeScript

#### Lucide for icons
This project uses Lucide for icons.  You can use them like this:

```
<script setup>
import { Camera } from 'lucide-vue-next';
</script>

<template>
  <Camera
    color="red"
    :size="32"
  />
</template>
```

### Project Structure

#### Server-Side (`/server`)
- **API Routes** (`/server/api/`): Server endpoints following Nuxt's file-based API routing (see [server/api/CLAUDE.md](server/api/CLAUDE.md))
- **Utilities** (`/server/utils/`):
  - `db.ts`: Database utilities - `executeQuery()` and `createClient()`
  - `auth.ts`: Google OAuth token verification and `defineProtectedEventHandler` wrapper

#### Client-Side
- **Pages** (`/pages/`): File-based routing system
  - `index.vue`: Public landing page
  - `login.vue`: Authentication page
  - `home.vue`: Protected dashboard
- **Stores** (`/stores/`): Pinia stores for state management
  - `auth.ts`: Authentication state with persistence
- **Middleware** (`/middleware/`):
  - `auth.global.ts`: Global auth middleware protecting routes

### Authentication Flow
1. User authenticates via Google OAuth on the client
2. Client sends Google ID token in Authorization header: `Bearer {token}`
3. Server verifies token with Google's OAuth2Client
4. Server creates/updates user in database
5. Protected routes use `defineProtectedEventHandler` wrapper

For implementation details, see [server/api/CLAUDE.md](server/api/CLAUDE.md).

### Database Schema
The application uses a migration-based approach. See [migrations/CLAUDE.md](migrations/CLAUDE.md) for:
- Migration system details
- Creating and running migrations
- Best practices and patterns

### Type System
The project uses TypeScript with shared types in the `/types` directory:

Examples:
- **`types/user.ts`** - User-related types (`User`, `GoogleUser`)
- **`types/api.ts`** - API-related types (`FetchOptions`, `DatabaseHealthResponse`, etc.)
- **`types/index.ts`** - Barrel exports for convenient imports

#### Adding New Types
1. **Shared types** (used in multiple files) → Add to `/types` directory
2. **Component-specific types** → Keep local to the component
3. **API response types** → Add to `types/api.ts`
4. **Domain models** → Create new file in `/types` (e.g., `types/item.ts`)

Example:
```typescript
// types/item.ts
export interface Item {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Usage
import type { Item } from '~/types';
```

Keep types files reasonable size and organized in a folder structure as they get too long. 


### Environment Variables
Required in `.env`:
- `NUXT_PUBLIC_GOOGLE_CLIENT_ID`: Google OAuth client ID
- `DATABASE_URL`: CockroachDB connection string

### Key Patterns

#### Client-Side API Calls

**For public endpoints** (no authentication required):
```typescript
// Use Nuxt's built-in $fetch
const status = await $fetch('/api/database/status');
const publicData = await $fetch('/api/public/info');
```

**For protected endpoints** (authentication required):
```typescript
// Use the useApi composable
const api = useApi();

// GET request with type safety
const userData = await api.get<User>('/api/user/me');

// POST request
const result = await api.post('/api/items', { 
  name: 'New Item',
  description: 'Description' 
});

// With query parameters
const items = await api.get('/api/items', {
  params: { page: '1', limit: '10' }
});

// DELETE request
await api.delete(`/api/items/${itemId}`);
```

The `useApi` utility:
- Automatically adds the Bearer token from the auth store
- Handles 401 errors by logging out and redirecting to login
- Provides TypeScript type safety for responses
- Supports all HTTP methods (GET, POST, PUT, PATCH, DELETE)

**When to use each:**
- `$fetch`: For public endpoints that don't require authentication
- `useApi`: For protected endpoints that require the Bearer token

#### Protected API Routes (Server-Side)
See [server/api/CLAUDE.md](server/api/CLAUDE.md) for:
- Creating public and protected endpoints
- Database operations (executeQuery vs createClient)
- Common patterns and error handling
- Recommended folder structure


#### Authentication State
```typescript
const authStore = useAuthStore();
authStore.isAuthenticated // Check auth status
authStore.user // Access user data
authStore.accessToken // Get token for API calls
```

## Important Development Notes

### General guidelines and Code Conventions
- Keep mobile layout in mind when making UI changes, the app should be responsive.
- Use the Nuxt `layouts` as appropriate for reusable layouts.
- Use existing patterns and libraries already in the codebase
- Use TypeScript for type safety
- When generating code files, keep them a manageable size, a few hundred lines at most.  If a file is getting too long, consider breaking it up into utility files or components and organizing them in a folder hierarchy. 

### Planning Guidelines
If a user asks you to make a plan:
- DO NOT add estimated timelines to plans - it's not helpful and should be avoided
- Focus on clear implementation steps and testable milestones instead

### Vue specific guidance
- Strongly prefer to use compositional API with `<script setup>` tags
- When writing functions use the "arrow function" syntax (example:  `const sendWelcomeEmail = async (email: string) => {})`)
- Prefer this ordering:  `<template>`, followed by `<script setup lang="ts">` followed by `<style>` (but only if needed because Tailwind couldn't do something very specific).
- When importing add the word `type` to the import for types, and use the `@` syntax for referring to the root of the project.  
    - Example: `import { type Organization } from '@/types/interfaces'`

## Cleanup
- **DO NOT** use `git add` commands - let the developer handle version control
- **DO NOT** stage files unless explicitly asked
- Focus on code changes, not git operations
- When creating temporary scripts, clean them up afterwards if we solved the problem or the script is not evergreen.  
- When checking TypeScript errors, use `npx tsc --noEmit --skipLibCheck` 