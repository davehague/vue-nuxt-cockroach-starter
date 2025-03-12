// server/utils/db.ts
import pkg from 'pg';
const { Client } = pkg;

// Create a database client
export async function createClient() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  await client.connect();
  return client;
}

// Execute a query and safely close the connection
export async function executeQuery(queryText: string, values: any[] = []) {
  const client = await createClient();
  
  try {
    const result = await client.query(queryText, values);
    return result;
  } finally {
    await client.end();
  }
}
