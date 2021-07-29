import type { IServiceConfigCrosspost } from './type';

const DEFAULTS = {
    integrationsOnly: false,
} as IServiceConfigCrosspost;

export function loadConfig(env: Record<string, string | undefined>): IServiceConfigCrosspost {
    return {
        channelIds: loadChannelIds(env),
        integrationsOnly: loadIntegrationsOnly(env) ?? DEFAULTS.integrationsOnly,
    };
}

function loadChannelIds(env: Record<string, string | undefined>) {
    const channelIds: string[] = [];

    const channelIdsStr = env.DISCORD_CROSSPOSTER_SERVICE_CROSSPOST_CHANNEL_IDS;
    if (channelIdsStr) {
        const channelIdStrs = channelIdsStr.trim().split(',');
        const digitRegex = /^\d+$/;
        for (const channelIdStr of channelIdStrs) {
            if (digitRegex.test(channelIdStr)) {
                channelIds.push(channelIdStr);
            }
        }
    }

    return channelIds;
}

function loadIntegrationsOnly(env: Record<string, string | undefined>) {
    const integrationsOnlyStr = env.DISCORD_CROSSPOSTER_SERVICE_CROSSPOST_INTEGRATIONS_ONLY;
    if (integrationsOnlyStr) {
        return integrationsOnlyStr.trim().toUpperCase() === 'TRUE';
    }
}
