declare namespace NodeJS {
    interface ProcessEnv {
        /** Git */
        readonly GIT_COMMIT_SHA?: string;
        readonly GIT_COMMIT_AUTHOR?: string;
        readonly GIT_COMMIT_DATE?: string;
        readonly GIT_COMMIT_TITLE?: string;

        /** Discord */
        readonly DISCORD_CROSSPOSTER_SERVICE_DISCORD_TOKEN?: string;

        /** Cross-posting */
        readonly DISCORD_CROSSPOSTER_SERVICE_CROSSPOST_CHANNEL_IDS?: string;
        readonly DISCORD_CROSSPOSTER_SERVICE_CROSSPOST_INTEGRATIONS_ONLY?: string;

        /** Activity-roles */
        readonly DISCORD_CROSSPOSTER_SERVICE_ACTIVITY_ROLES_ASSOCIATIONS?: string;

        /** Metrics Server */
        readonly DISCORD_CROSSPOSTER_SERVICE_METRICS_SERVER_HOST?: string;
        readonly DISCORD_CROSSPOSTER_SERVICE_METRICS_SERVER_PORT?: string;
        readonly DISCORD_CROSSPOSTER_SERVICE_METRICS_SERVER_TRUST_PROXY?: string;
    }
}
