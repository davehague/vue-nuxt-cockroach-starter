# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with API endpoints in this repository.

## Creating API Endpoints

Nuxt 3 uses file-based routing for API endpoints. Files in `/server/api/` automatically become API routes.

### Public Endpoints

For endpoints that don't require authentication:

```typescript
// server/api/public/example.ts
export default defineEventHandler(async (event) => {
  // Your logic here
  return { message: "Public data" };
});
```

### Protected Endpoints

For endpoints that require authentication, use the `defineProtectedEventHandler` wrapper:

```typescript
// server/api/protected/example.ts
import { defineProtectedEventHandler } from "~/server/utils/auth";

export default defineProtectedEventHandler(async (event, authenticatedUser) => {
  // authenticatedUser is automatically verified and contains:
  // - id: string
  // - email: string  
  // - name: string
  // - picture?: string
  
  // Your protected logic here
  return { 
    message: "Protected data",
    userId: authenticatedUser.id 
  };
});
```

## Authentication Flow

1. **Client sends request** with Authorization header: `Bearer {google-id-token}`
2. **Server verifies token** with Google OAuth2Client
3. **Server looks up/creates user** in database
4. **Handler receives authenticated user** object

## Common Patterns

### Getting Request Body
```typescript
export default defineProtectedEventHandler(async (event, user) => {
  const body = await readBody(event);
  // Process body...
});
```

### Query Parameters
```typescript
export default defineProtectedEventHandler(async (event, user) => {
  const { id } = getQuery(event);
  // Use query params...
});
```

### Database Operations

The project provides two database utilities in `~/server/utils/db`:

1. **`executeQuery`** - For simple queries (recommended for most cases)
2. **`createClient`** - For complex operations requiring manual connection management

#### Using executeQuery (Recommended)
```typescript
import { executeQuery } from "~/server/utils/db";

export default defineProtectedEventHandler(async (event, user) => {
  const result = await executeQuery(
    "SELECT * FROM items WHERE user_id = $1",
    [user.id]
  );
  return result.rows;
});
```

#### Using createClient (Advanced)
Use `createClient` when you need:
- Multiple queries in a transaction
- Streaming large result sets
- Fine-grained connection control

```typescript
import { createClient } from "~/server/utils/db";

export default defineProtectedEventHandler(async (event, user) => {
  const client = await createClient();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    // Multiple related queries
    const itemResult = await client.query(
      'INSERT INTO items (user_id, name) VALUES ($1, $2) RETURNING id',
      [user.id, 'New Item']
    );
    
    await client.query(
      'INSERT INTO item_history (item_id, action) VALUES ($1, $2)',
      [itemResult.rows[0].id, 'created']
    );
    
    // Commit transaction
    await client.query('COMMIT');
    
    return { success: true, itemId: itemResult.rows[0].id };
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    throw error;
  } finally {
    // ALWAYS close the connection
    await client.end();
  }
});
```

**Important**: When using `createClient`, you MUST:
- Always call `client.end()` in a `finally` block
- Handle errors appropriately
- Use transactions for related operations

### Error Handling
```typescript
export default defineProtectedEventHandler(async (event, user) => {
  const { id } = getQuery(event);
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ID is required"
    });
  }
  
  // Continue processing...
});
```

### HTTP Methods
```typescript
export default defineProtectedEventHandler(async (event, user) => {
  const method = event.method;
  
  switch (method) {
    case "GET":
      // Handle GET
      break;
    case "POST":
      // Handle POST
      break;
    case "DELETE":
      // Handle DELETE
      break;
    default:
      throw createError({
        statusCode: 405,
        message: "Method not allowed"
      });
  }
});
```

## Recommended Folder Structure

Organize your API endpoints with clear boundaries between public and protected resources:

Example:
```
server/api/
├── public/              # Public endpoints (no auth required)
│   ├── health/         # System health checks
│   │   ├── index.ts    # GET /api/public/health
│   │   └── database.ts # GET /api/public/health/database
│   └── status.ts       # GET /api/public/status
├── auth/               # Authentication endpoints
│   ├── login.ts        # POST /api/auth/login (if server-side)
│   └── logout.ts       # POST /api/auth/logout
├── user/               # User resource endpoints (protected)
│   ├── index.ts        # GET /api/user (list users - admin only)
│   ├── me.ts          # GET /api/user/me (current user)
│   └── [id].ts        # GET/PATCH/DELETE /api/user/:id
├── items/              # Example resource (protected)
│   ├── index.ts       # GET/POST /api/items
│   └── [id].ts        # GET/PATCH/DELETE /api/items/:id
└── admin/              # Admin-only endpoints
    └── stats.ts        # GET /api/admin/stats
```

### Key Principles

1. **Clear Authentication Boundaries**: 
   - `public/` folder contains all endpoints that don't require authentication
   - All other folders contain protected endpoints by default

2. **Resource-Oriented Design**:
   - Organize by resource type (users, items, etc.)
   - Follow RESTful conventions

3. **File Naming Conventions**:
   - `index.ts` - Collection operations (GET all, POST new)
   - `[id].ts` - Individual resource operations (GET/PATCH/DELETE by ID)
   - Named files for specific actions (e.g., `me.ts` for current user)

### Example Implementations

**Public Health Check** (`server/api/public/health/database.ts`):
```typescript
import { createClient } from "~/server/utils/db";

export default defineEventHandler(async (event) => {
  const client = await createClient();
  try {
    const result = await client.query("SELECT NOW()");
    return {
      status: "healthy",
      timestamp: result.rows[0].now,
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message,
    };
  } finally {
    await client.end();
  }
});
```

Note: This example uses `createClient` directly because it's a simple connectivity check. For most queries, prefer `executeQuery`.

**Resource Collection** (`server/api/items/index.ts`):
```typescript
export default defineProtectedEventHandler(async (event, user) => {
  if (event.method === "GET") {
    // List items for user
    const result = await executeQuery(
      "SELECT * FROM items WHERE user_id = $1 ORDER BY created_at DESC",
      [user.id]
    );
    return result.rows;
  }
  
  if (event.method === "POST") {
    // Create new item
    const body = await readBody(event);
    const result = await executeQuery(
      "INSERT INTO items (user_id, name, description) VALUES ($1, $2, $3) RETURNING *",
      [user.id, body.name, body.description]
    );
    return result.rows[0];
  }
  
  throw createError({
    statusCode: 405,
    message: "Method not allowed"
  });
});
```

**Individual Resource** (`server/api/items/[id].ts`):
```typescript
export default defineProtectedEventHandler(async (event, user) => {
  const itemId = getRouterParam(event, 'id');
  
  // Verify ownership
  const ownership = await executeQuery(
    "SELECT user_id FROM items WHERE id = $1",
    [itemId]
  );
  
  if (ownership.rows.length === 0) {
    throw createError({ statusCode: 404, message: "Item not found" });
  }
  
  if (ownership.rows[0].user_id !== user.id) {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }
  
  // Handle different methods...
});
```

## Security Notes

1. **Always validate input** - Don't trust client data
2. **Use parameterized queries** - Prevent SQL injection
3. **Check resource ownership** - Verify user can access the requested resource
4. **Return minimal data** - Don't expose internal IDs or sensitive info unnecessarily

## Testing Protected Endpoints

When testing locally, you need a valid Google ID token. Options:
1. Use the frontend login flow to get a real token
2. Create a test endpoint that bypasses auth (development only)
3. Use the Google OAuth playground to generate test tokens