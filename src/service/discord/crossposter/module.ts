export type ChannelID = string;

export interface IMessage {
    webhookId?: string;
    author: {
        isBot: boolean;
    };
    channelId: ChannelID;
}

export interface ICrossposterModule {
    isCrosspostable(message: IMessage): boolean;
}

export interface ICrossposterOptions {
    channelIds: Iterable<ChannelID>;
    integrationsOnly: boolean;
}

export class CrossposterModule implements ICrossposterModule {
    protected _channelIds: Set<ChannelID>;
    protected _integrationsOnly: boolean;

    public constructor({ channelIds, integrationsOnly }: ICrossposterOptions) {
        this._channelIds = new Set(channelIds);
        this._integrationsOnly = integrationsOnly;
    }

    public isCrosspostable(message: IMessage): boolean {
        /** Must be in the channelIds set */
        if (!this._channelIds.has(message.channelId)) {
            return false;
        }

        /** If we only allow integrations but the message is not from an integration */
        if (this._integrationsOnly && !(message.webhookId || message.author.isBot)) {
            return false;
        }

        return true;
    }
}
