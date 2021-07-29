import type { IServiceConfigDiscord } from './type';

export function loadConfig(env: Record<string, string | undefined>): IServiceConfigDiscord {
    return {
        token: loadToken(env),
    };
}

function loadToken(env: Record<string, string | undefined>) {
    const token = env.DISCORD_CROSSPOSTER_SERVICE_DISCORD_TOKEN;
    if (!token) {
        throw new TypeError('No Discord Token Specified.');
    }
    return token;
}
