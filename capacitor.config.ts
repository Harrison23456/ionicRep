import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'IdentificaPE',
  webDir: 'www',
  server:{
    cleartext: true, // Permitir HTTP sin cifrar (útil para desarrollo)

  }
};

export default config;
