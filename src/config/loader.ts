import * as Crosspost from './crosspost';
import * as Discord from './discord';
import * as MetricsServer from './metrics-server';
import type { IServiceConfig } from './type';

let config: IServiceConfig | undefined;
export function loadConfig(env = process.env): IServiceConfig {
    if (!config) {
        config = {
            crosspost: Crosspost.loadConfig(env),
            discord: Discord.loadConfig(env),
            metricsServer: MetricsServer.loadConfig(env),
        };
    }

    return config;
}
