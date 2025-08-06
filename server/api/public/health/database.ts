import { defineEventHandler } from "h3";
import { createClient } from "~/server/utils/db";

export default defineEventHandler(async (event) => {
  const client = await createClient();

  try {
    const result = await client.query("SELECT NOW()");
    return {
      status: "healthy",
      timestamp: result.rows[0].now,
    };
  } catch (error: any) {
    console.error("Database health check failed:", error);
    return { 
      status: "unhealthy", 
      error: error.message 
    };
  } finally {
    await client.end();
  }
});
