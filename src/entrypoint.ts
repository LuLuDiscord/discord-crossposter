/* eslint-disable import/first */
import { install } from 'source-map-support';

install();

import { loadConfig } from './config';
import type { IApplication } from './service';
import { Service } from './service';

const config = loadConfig();
const service: IApplication = new Service(config);

process.on('SIGTERM', async () => {
    await service.stop();
    process.exit();
});

service.start();
