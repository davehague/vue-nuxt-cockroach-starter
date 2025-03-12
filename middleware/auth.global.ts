export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();
  const publicRoutes = ["/"];
  const authRoutes = ["/login"];

  // Allow public routes
  if (publicRoutes.includes(to.path)) {
    return;
  }

  // Allow auth routes when not authenticated
  if (!authStore.isAuthenticated && authRoutes.includes(to.path)) {
    return;
  }

  // Redirect to login if trying to access protected routes while not authenticated
  if (!authStore.isAuthenticated) {
    return navigateTo("/login");
  }

  // Redirect to home if trying to access auth routes while authenticated
  if (authStore.isAuthenticated && authRoutes.includes(to.path)) {
    return navigateTo("/home");
  }
});
