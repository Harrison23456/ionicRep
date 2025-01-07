import { registerPlugin } from '@capacitor/core';

import type { AndroidIdPluginPlugin } from './definitions';

const AndroidIdPlugin = registerPlugin<AndroidIdPluginPlugin>('AndroidIdPlugin', {
  web: () => import('./web').then((m) => new m.AndroidIdPluginWeb()),
});

export * from './definitions';
export { AndroidIdPlugin };
