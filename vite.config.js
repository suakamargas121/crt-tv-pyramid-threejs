import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true, // Allow all hosts / domains
    cors: true
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true, // Allow all hosts / domains
    cors: true
  }
});
