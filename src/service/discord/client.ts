import retry from 'async-retry';
import * as Discord from 'discord.js';

import type { IDispose } from '../dispose';
import * as Crossposter from './crossposter';
import * as Metrics from './metrics';

export interface IClient extends IDispose {
    connect(): Promise<void>;
}

export interface IClientOptions {
    token: string;
    crossposter: Crossposter.ICrossposterOptions;
}

export class Client implements IClient {
    private readonly _token: string;

    protected _discord: Discord.Client;
    protected _crossposter: Crossposter.CrossposterModule;

    public constructor({ token, crossposter }: IClientOptions) {
        this._token = token;
        this._discord = new Discord.Client({
            intents: ['GUILD_MESSAGES', 'GUILD_WEBHOOKS', 'GUILDS'],
            presence: { status: 'online' },
            ws: { compress: true },
        });

        this._discord.on('debug', (message) => console.log(`[Discord] ${message}`));
        this._discord.on('error', (message) => console.log(`[Discord] ${message}`));
        this._discord.on('warn', (message) => console.log(`[Discord] ${message}`));

        this._crossposter = new Crossposter.CrossposterModule({
            channelIds: crossposter.channelIds,
            integrationsOnly: crossposter.integrationsOnly,
        });

        this._discord.on('message', this._onMessage);
    }

    public dispose(): void {
        this._discord.destroy();
    }

    public async connect() {
        await this._discord.login(this._token);
    }

    private _onMessage = async (message: Discord.Message) => {
        /** If we don't have permission to cross-post a message */
        if (!message.crosspostable) {
            return;
        }

        const isCrosspostable = this._crossposter.isCrosspostable({
            author: { isBot: message.author.bot },
            channelId: message.channel.id,
            webhookId: message.webhookID ?? undefined,
        });

        /** If we should cross-post this message */
        if (isCrosspostable) {
            try {
                await retry(
                    () => {
                        console.info(
                            `Attempting to crosspost message ${message.id} in guild '${message.guild?.name}' (${message.guild?.id})`
                        );
                        return message.crosspost();
                    },
                    { retries: 2 }
                );
                Metrics.SUCCESSFUL_CROSSPOSTS.inc({ channel_id: message.channel.id });
                console.info(
                    `Successfully crossposted message ${message.id} in guild '${message.guild?.name}' (${message.guild?.id})`
                );
            } catch (err) {
                Metrics.ERRORED_CROSSPOSTS.inc({ channel_id: message.channel.id });
                console.error(`An error occured crossposting: ${(err as Error).stack}`);
            }
        }
    };
}
