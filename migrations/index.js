import 'dotenv/config'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import pkg from 'pg';
const { Client } = pkg;

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function runMigrations() {
  const client = new Client(process.env.DATABASE_URL)
  
  try {
    console.log('Connecting to database...')
    await client.connect()
    
    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Get list of applied migrations
    const { rows } = await client.query('SELECT name FROM migrations')
    const appliedMigrations = new Set(rows.map(row => row.name))
    
    // Read migration directory
    const migrationsDir = path.join(__dirname, 'sql')
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort() // Ensure migrations run in order (001-xxx.sql, 002-xxx.sql, etc.)
    
    // Apply each migration that hasn't been applied yet
    for (const file of migrationFiles) {
      if (!appliedMigrations.has(file)) {
        console.log(`Applying migration: ${file}`)
        
        // Read migration file
        const migrationPath = path.join(migrationsDir, file)
        const migrationSql = fs.readFileSync(migrationPath, 'utf8')
        
        // Start a transaction
        await client.query('BEGIN')
        
        try {
          // Apply the migration
          await client.query(migrationSql)
          
          // Record the migration
          await client.query(
            'INSERT INTO migrations (name) VALUES ($1)',
            [file]
          )
          
          // Commit the transaction
          await client.query('COMMIT')
          console.log(`Successfully applied migration: ${file}`)
        } catch (error) {
          // Rollback on error
          await client.query('ROLLBACK')
          console.error(`Error applying migration ${file}:`, error)
          throw error
        }
      }
    }
    
    console.log('All migrations applied successfully!')
  } catch (error) {
    console.error('Migration error:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigrations()