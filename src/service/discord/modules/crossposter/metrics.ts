import * as PromClient from 'prom-client';

export const SUCCESSFUL_CROSSPOSTS = new PromClient.Counter({
    help: 'A counter for how many Discord cross-posts are successfully executed.',
    labelNames: ['channel_id'],
    name: 'discord_successful_crossposts',
});

export const ERRORED_CROSSPOSTS = new PromClient.Counter({
    help: 'A counter for how many Discord cross-posts errored during execution.',
    labelNames: ['channel_id'],
    name: 'discord_errored_crossposts',
});
