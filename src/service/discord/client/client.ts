import * as Discord from 'discord.js';

import type { IDispose } from '../../dispose';
import type { ModulePrototype } from '../module';

export interface IDiscordClient {
    connect(): Promise<void>;
    addModule<P extends object>(module: ModulePrototype<P>, params: P): void;
}

export interface IDiscordClientOptions {
    token: string;
}

export class DiscordClient implements IDiscordClient, IDispose {
    private readonly _token: string;
    protected _discord: Discord.Client;

    public constructor({ token }: IDiscordClientOptions) {
        this._token = token;
        this._discord = new Discord.Client({
            intents: ['GUILD_MESSAGES', 'GUILD_WEBHOOKS', 'GUILDS', 'GUILD_PRESENCES', 'GUILD_MEMBERS'],
            presence: { status: 'online' },
            ws: { compress: true },
        });

        this._discord.on('debug', (message) => console.log(`[Discord] ${message}`));
        this._discord.on('error', (message) => console.log(`[Discord] ${message}`));
        this._discord.on('warn', (message) => console.log(`[Discord] ${message}`));
    }

    public addModule<P extends object>(module: ModulePrototype<P>, params: P): void {
        new module(this._discord, params);
    }

    public dispose(): void {
        this._discord.destroy();
    }

    public async connect() {
        await this._discord.login(this._token);
    }
}
