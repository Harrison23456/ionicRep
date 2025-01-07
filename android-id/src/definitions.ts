export interface AndroidIdPluginPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
