import type * as Config from '../config';
import * as Discord from './discord';
import * as MetricsServer from './metrics-server';

export interface IApplication {
    start(): Promise<void> | void;
    stop(): Promise<void> | void;
}

export class Service implements IApplication {
    private readonly _discord: Discord.IClient;
    private readonly _metricsServer: MetricsServer.IServer;

    public constructor(config: Config.IServiceConfig) {
        this._metricsServer = new MetricsServer.Server({
            host: config.metricsServer.host,
            port: config.metricsServer.port,
            trustProxy: config.metricsServer.trustProxy,
        });
        this._discord = new Discord.Client({
            crossposter: {
                channelIds: config.crosspost.channelIds,
                integrationsOnly: config.crosspost.integrationsOnly,
            },
            token: config.discord.token,
        });
    }

    public async start() {
        await this._discord.connect();
        await this._metricsServer.listen();
        console.log(`[MetricsServer] Listening at ${this._metricsServer.host}:${this._metricsServer.port}`);
    }

    public async stop() {
        await this._metricsServer.close();
        this._discord.dispose();
    }
}
