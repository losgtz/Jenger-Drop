import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jengerluxurious.drop',
  appName: '2nd Chance Resale',
  webDir: 'out',
  // NOTE: `bundledWebRuntime` was removed from CapacitorConfig in Capacitor 8,
  // so it is intentionally omitted here (it would fail type-checking).
};

export default config;
