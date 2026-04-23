export const config = {
  backendUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  publicBackendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080',
} as const;
