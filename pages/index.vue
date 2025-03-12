<template>
  <div class="h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
      <div>
        <h1 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Vue Nuxt CockroachDB Starter
        </h1>
        <p class="mt-2 text-center text-sm text-gray-600">
          A starter template with Google Auth and CockroachDB
        </p>
      </div>
      <div class="flex flex-col items-center justify-center mt-8">
        <div v-if="!authStore.isAuthenticated">
          <NuxtLink to="/login" class="btn btn-primary">
            Sign in to get started
          </NuxtLink>
        </div>
        <div v-else>
          <NuxtLink to="/home" class="btn btn-primary">
            Go to Dashboard
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore();
</script>
