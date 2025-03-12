// server/utils/auth.ts
import { H3Event, createError, getHeader } from "h3";
import { OAuth2Client } from "google-auth-library";
import { executeQuery } from "./db";

const client = new OAuth2Client(process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID);

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface GoogleUser {
  email: string;
  name: string;
  picture?: string;
}

export async function verifyAuth(event: H3Event): Promise<AuthenticatedUser> {
  const authHeader = getHeader(event, "Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized: Missing token",
    });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email || !payload.email_verified) {
      throw new Error("Invalid token payload");
    }

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      throw new Error("Token has expired");
    }

    if (
      payload.iss !== "accounts.google.com" &&
      payload.iss !== "https://accounts.google.com"
    ) {
      throw new Error("Invalid token issuer");
    }

    // Find or create user in our database
    const googleUser: GoogleUser = {
      email: payload.email,
      name: payload.name || "",
      picture: payload.picture
    };

    // Check if user exists
    const existingUser = await findUserByEmail(googleUser.email);
    
    let user: AuthenticatedUser;
    
    if (existingUser) {
      // Update last login time
      await updateUserLogin(existingUser.id);
      user = existingUser;
    } else {
      // Create new user
      user = await createUser(googleUser);
    }

    return user;
  } catch (error) {
    console.error("Token verification failed:", error);
    throw createError({
      statusCode: 401,
      message: "Unauthorized: Invalid token",
    });
  }
}

// Helper to verify user can access requested resource
export function verifyUserAccess(
  authenticatedEmail: string,
  requestedEmail: string
) {
  if (authenticatedEmail !== requestedEmail) {
    throw createError({
      statusCode: 403,
      message: "Forbidden: Unauthorized access",
    });
  }
}

// Create a wrapper for protected routes
export function defineProtectedEventHandler(
  handler: (
    event: H3Event,
    authenticatedUser: AuthenticatedUser
  ) => Promise<any>
) {
  return defineEventHandler(async (event: H3Event) => {
    const authenticatedUser = await verifyAuth(event);
    return handler(event, authenticatedUser);
  });
}

// Database functions for user management
async function findUserByEmail(email: string): Promise<AuthenticatedUser | null> {
  const result = await executeQuery(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0];
}

async function createUser(user: GoogleUser): Promise<AuthenticatedUser> {
  const result = await executeQuery(
    `INSERT INTO users (email, name, picture) 
     VALUES ($1, $2, $3) 
     RETURNING *`,
    [user.email, user.name, user.picture]
  );
  
  return result.rows[0];
}

async function updateUserLogin(userId: string): Promise<void> {
  await executeQuery(
    `UPDATE users 
     SET last_login = CURRENT_TIMESTAMP, 
         updated_at = CURRENT_TIMESTAMP 
     WHERE id = $1`,
    [userId]
  );
}
