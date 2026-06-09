import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.navibot.app',
  appName: 'NaviBot',
  webDir: 'dist',
  server: {
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
