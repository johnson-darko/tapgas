import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.queenlyexpress.gasman',
  appName: 'GASMAN',
  webDir: 'dist',
  server: {
    url: 'https://johnson-darko.github.io/tapgas/', // Always load from your deployed GitHub Pages site
    cleartext: true
  }
};

export default config;
