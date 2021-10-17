import * as PromClient from 'prom-client';

export const PRESENCE_CHANGES = new PromClient.Counter({
    help: 'A counter for how many Discord presence changes have been processed for activity-roles.',
    labelNames: ['guild_id'],
    name: 'discord_activity_roles_presence_changes',
});

export const ROLES_ISSUED = new PromClient.Counter({
    help: 'A counter for how many Discord roles have been granted for activity-role associations.',
    labelNames: ['guild_id', 'role_id'],
    name: 'discord_activity_roles_issued',
});
