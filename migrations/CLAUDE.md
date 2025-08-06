## Database Migration System

This project uses a custom migration system built with Node.js and the pg library. Migrations are SQL files that are executed in alphabetical order and tracked in a `migrations` table in the database.

## NPM Scripts

### Running Migrations
```bash
npm run db:migrate
```
This command:
1. Connects to the database using the `DATABASE_URL` environment variable
2. Creates a `migrations` table if it doesn't exist
3. Reads all `.sql` files from `migrations/sql/` directory
4. Executes migrations that haven't been applied yet (in alphabetical order)
5. Records each successful migration in the `migrations` table
6. Uses transactions to ensure atomicity - if a migration fails, it rolls back

### Creating New Migrations
```bash
npm run db:create-migration <migration-name>
```
Example:
```bash
npm run db:create-migration add-user-preferences
```

This command:
1. Takes the migration name from the command line argument
2. Counts existing migrations to determine the next number
3. Creates a new file with format: `{number}-{migration-name}.sql`
4. Pads the number with zeros (e.g., `001`, `002`, `003`)
5. Creates an empty migration file with a comment header

## Migration File Structure

### Naming Convention
- Files are named: `{3-digit-number}-{descriptive-name}.sql`
- Examples:
  - `001-create-users-table.sql`
  - `002-add-user-preferences.sql`
  - `003-create-sessions-table.sql`

### File Content
Each migration file should:
1. Start with a comment describing the migration
2. Contain valid SQL statements for CockroachDB
3. Be idempotent when possible (use `IF NOT EXISTS`, `IF EXISTS`)

Example migration:
```sql
-- Migration: add-user-preferences

CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(50) DEFAULT 'light',
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
```

## Implementation Details

### Migration Runner (`index.js`)
- Uses ES modules with `import` statements
- Creates a `migrations` table to track applied migrations
- Runs migrations in a transaction for safety
- Provides detailed console output for debugging
- Exits with error code 1 if migrations fail

### Migration Creator (`create.js`)
- Automatically determines the next migration number
- Creates the `sql/` directory if it doesn't exist
- Validates that a migration name is provided
- Creates an empty file with a comment header

### Database Connection
- Uses the `DATABASE_URL` environment variable
- Expects a CockroachDB/PostgreSQL connection string
- Requires `dotenv` to load environment variables

## Best Practices

1. **Always test migrations locally** before applying to production
2. **Keep migrations small and focused** - one logical change per migration
3. **Never modify existing migrations** - create new ones to fix issues
4. **Use transactions** for multi-statement migrations
5. **Make migrations idempotent** when possible
6. **Include rollback considerations** in comments if the migration is destructive

## Common Migration Patterns

### Adding a New Table
```sql
CREATE TABLE IF NOT EXISTS table_name (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- other columns
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Adding a Column
```sql
ALTER TABLE table_name 
ADD COLUMN IF NOT EXISTS column_name VARCHAR(255);
```

### Creating an Index
```sql
CREATE INDEX IF NOT EXISTS idx_name ON table_name(column_name);
```

### Adding a Foreign Key
```sql
ALTER TABLE child_table
ADD CONSTRAINT fk_name 
FOREIGN KEY (parent_id) 
REFERENCES parent_table(id) 
ON DELETE CASCADE;
```