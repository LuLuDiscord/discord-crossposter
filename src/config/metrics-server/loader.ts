import type { IServiceConfigMetricsServer } from './type';

const DEFAULTS = {
    host: '0.0.0.0',
    port: 9090,
    trustProxy: false,
} as IServiceConfigMetricsServer;

export function loadConfig(env: Record<string, string | undefined>): IServiceConfigMetricsServer {
    return {
        host: loadHost(env) ?? DEFAULTS.host,
        port: loadPort(env) ?? DEFAULTS.port,
        trustProxy: loadTrustProxy(env) ?? DEFAULTS.trustProxy,
    };
}

function loadHost(env: Record<string, string | undefined>) {
    const host = env.DISCORD_CROSSPOSTER_SERVICE_METRICS_SERVER_HOST;
    if (host) {
        return host;
    }
}

function loadPort(env: Record<string, string | undefined>) {
    const port = env.DISCORD_CROSSPOSTER_SERVICE_METRICS_SERVER_PORT;
    if (port) {
        const parsed = parseInt(port, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 65535) {
            return parsed;
        }
    }
}

function loadTrustProxy(env: Record<string, string | undefined>) {
    const trustProxyStr = env.DISCORD_CROSSPOSTER_SERVICE_METRICS_SERVER_TRUST_PROXY;
    if (trustProxyStr) {
        return trustProxyStr.trim().toUpperCase() === 'TRUE';
    }
}
