<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="border-4 border-dashed border-gray-200 rounded-lg bg-white p-8">
          <div class="flex items-center space-x-4">
            <img v-if="authStore.user?.picture" :src="authStore.user.picture" class="h-12 w-12 rounded-full" />
            <div v-else class="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
              {{ firstInitial }}
            </div>
            <div>
              <h2 class="text-2xl font-bold">Welcome, {{ authStore.user?.name }}</h2>
              <p class="text-gray-600">{{ authStore.user?.email }}</p>
            </div>
          </div>
          
          <div class="mt-8">
            <h3 class="text-lg font-semibold mb-2">Database Status</h3>
            <div v-if="dbStatus" class="p-4 bg-gray-50 rounded-md">
              <p>Status: <span class="font-medium" :class="dbStatus.status === 'connected' ? 'text-green-600' : 'text-red-600'">{{ dbStatus.status }}</span></p>
              <p v-if="dbStatus.time">Database Time: {{ new Date(dbStatus.time).toLocaleString() }}</p>
              <p v-if="dbStatus.message" class="text-red-600">{{ dbStatus.message }}</p>
            </div>
            <div v-else class="p-4 bg-gray-50 rounded-md">
              Loading database status...
            </div>
          </div>
          
          <div class="mt-8">
            <button @click="logout" class="btn btn-secondary">Sign Out</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore();
const router = useRouter();
const dbStatus = ref(null);

// Get first initial for avatar fallback
const firstInitial = computed(() => {
  return authStore.user?.name ? authStore.user.name.charAt(0).toUpperCase() : '?';
});

// Get database status
onMounted(async () => {
  try {
    dbStatus.value = await $fetch("/api/database/status");
  } catch (error) {
    console.error("Error fetching DB status:", error);
    dbStatus.value = { status: "error", message: "Failed to connect to database" };
  }
});

// Logout function
async function logout() {
  authStore.logout();
  router.push("/");
}
</script>
