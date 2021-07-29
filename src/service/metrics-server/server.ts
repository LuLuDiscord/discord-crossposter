import * as Fastify from 'fastify';
import FastifyMetrics from 'fastify-metrics';

export interface IServerOptions {
    host: string;
    port: number;
    trustProxy?: boolean;
}

export interface IServer {
    host: string;
    port: number;
    listen(): Promise<void>;
    close(): Promise<void>;
}

export class Server implements IServer {
    protected _server: Fastify.FastifyInstance;
    private readonly _host: string;
    private readonly _port: number;

    public constructor({ host, port, trustProxy }: IServerOptions) {
        this._host = host;
        this._port = port;
        this._server = Fastify.fastify({ trustProxy });
        this._server.register(FastifyMetrics, {
            enableDefaultMetrics: true,
            enableRouteMetrics: true,
            endpoint: '/metrics',
        });
        this._server.get('/', () => Promise.resolve('OK'));
        this._server.get('/healthz', () => Promise.resolve('OK'));
    }

    public get host() {
        return this._host;
    }

    public get port() {
        return this._port;
    }

    public async listen(): Promise<void> {
        await this._server.listen({ host: this._host, port: this._port });
    }

    public async close() {
        await this._server.close();
    }
}
