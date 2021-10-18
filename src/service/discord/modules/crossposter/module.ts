import retry from 'async-retry';
import type * as Discord from 'discord.js';

import type { IModule } from '../../module';
import { Module } from '../../module';
import type { ICrossposterLogic, ICrossposterLogicOptions } from './logic';
import { CrossposterLogic } from './logic';
import * as Metrics from './metrics';

export class CrossposterModule extends Module implements IModule {
    protected logic: ICrossposterLogic;

    public constructor(client: Discord.Client, options: ICrossposterLogicOptions) {
        super(client);
        this.logic = new CrossposterLogic(options);
        this._init();
    }

    public destroy(): void {
        this._client.off('messageCreate', this._onMessage);
    }

    private _init() {
        this._client.on('messageCreate', this._onMessage);
    }

    private async _onMessage(message: Discord.Message) {
        /** If we don't have permission to cross-post a message */
        if (!message.crosspostable) {
            return;
        }

        const isCrosspostable = this.logic.isCrosspostable({
            author: { isBot: message.author.bot },
            channelId: message.channel.id,
            webhookId: message.webhookId || undefined,
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
    }
}
