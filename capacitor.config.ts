import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter', 
  appName: 'IdentificaPE',
  webDir: 'www',
  server: {
    cleartext: true,
  },
  plugins: {
    AppflowDeploy: {
      appId: '2d4aa589', 
      channel: 'Production', 
      autoUpdateMethod: 'background', 
      maxVersions: 2,
      updateApi: 'https://api.ionicjs.com',
    }
  }
};

export default config;
