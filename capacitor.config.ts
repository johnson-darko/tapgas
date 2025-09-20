import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.queenlyexpress.gasman',
  appName: 'GASMAN',
  webDir: 'dist',
  server: {
    url: 'https://gasmanapp.com/', // Always load from your deployed custom domain
    cleartext: true
  }
};

export default config;
