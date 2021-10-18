import type { IServiceConfigActivityRoles } from './activity-roles';
import type { IServiceConfigCrosspost } from './crosspost';
import type { IServiceConfigDiscord } from './discord';
import type { IServiceConfigMetricsServer } from './metrics-server';

export interface IServiceConfig {
    readonly crosspost: IServiceConfigCrosspost;
    readonly discord: IServiceConfigDiscord;
    readonly metricsServer: IServiceConfigMetricsServer;
    readonly activityRoles: IServiceConfigActivityRoles;
}
