// server/api/database/status.ts
import { defineEventHandler } from "h3";
import { createClient } from "@/server/utils/db";

export default defineEventHandler(async (event) => {
  const client = await createClient();

  try {
    const results = await client.query("SELECT NOW()");
    return {
      status: "connected",
      time: results.rows[0].now,
    };
  } catch (err: any) {
    console.error("error executing query:", err);
    return { 
      status: "error", 
      message: err.message 
    };
  } finally {
    await client.end();
  }
});
