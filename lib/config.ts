export const config = {
  backendUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
} as const;
