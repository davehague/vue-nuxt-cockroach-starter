import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Get migration name from command line
const migrationName = process.argv[2]

if (!migrationName) {
  console.error('Please provide a migration name')
  console.error('Example: npm run db:create-migration add-user-preferences')
  process.exit(1)
}

// Create migrations directory if it doesn't exist
const migrationsDir = path.join(__dirname, 'sql')
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true })
}

// Get existing migrations to determine next number
const existingMigrations = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))

// Create new migration number (padded with zeros)
const nextNumber = existingMigrations.length + 1
const paddedNumber = String(nextNumber).padStart(3, '0')

// Create file name
const fileName = `${paddedNumber}-${migrationName}.sql`
const filePath = path.join(migrationsDir, fileName)

// Create empty migration file
fs.writeFileSync(filePath, `-- Migration: ${migrationName}\n\n`)

console.log(`Created new migration: ${fileName}`)