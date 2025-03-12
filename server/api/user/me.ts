import { defineProtectedEventHandler } from "@/server/utils/auth";

export default defineProtectedEventHandler(async (event, user) => {
  // Just return the authenticated user data
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    picture: user.picture
  };
});
