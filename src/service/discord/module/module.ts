import type * as Discord from 'discord.js';

export interface IModule {
    destroy(): void;
}

export abstract class Module {
    protected readonly _client: Discord.Client;

    public constructor(client: Discord.Client) {
        this._client = client;
    }
}

export interface ModulePrototype<P extends object> {
    new (client: Discord.Client, params: P): Module;
}
