<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
      </div>
      <div class="mt-8 space-y-6">
        <div>
          <GoogleSignInButton class="w-full" @success="onSuccess" @error="onError" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore();
const router = useRouter();

async function onSuccess(response: any) {
  try {
    const credential = response.credential;
    
    // Set token in auth store
    authStore.setAccessToken(credential);
    
    // Get user data using the token
    const userData = await $fetch("/api/user/me", {
      headers: {
        Authorization: `Bearer ${credential}`,
      },
    });
    
    // Set user data in auth store
    authStore.setUser(userData);
    
    // Redirect to home page
    router.push("/home");
  } catch (error) {
    console.error("Authentication error:", error);
    alert("Authentication failed. Please try again.");
  }
}

function onError(error: any) {
  console.error("Google Sign-In error:", error);
  alert("Google Sign-In failed. Please try again.");
}
</script>
