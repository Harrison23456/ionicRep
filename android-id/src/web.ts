import { WebPlugin } from '@capacitor/core';

import type { AndroidIdPluginPlugin } from './definitions';

export class AndroidIdPluginWeb extends WebPlugin implements AndroidIdPluginPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
