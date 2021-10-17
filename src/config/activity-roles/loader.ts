import type { ActivityRoleAssociations, IServiceConfigActivityRoles } from './type';

const DEFAULTS = {
    associations: new Map(),
} as IServiceConfigActivityRoles;

export function loadConfig(env: Record<string, string | undefined>): IServiceConfigActivityRoles {
    return {
        associations: loadAssociations(env) || DEFAULTS.associations,
    };
}

const DIGIT_REGEXP = /^\d+$/;
function loadAssociations(env: Record<string, string | undefined>): ActivityRoleAssociations | void {
    /**
     * Assuming the format is like:
     *
     * guildId1->activityId1@roleId1#roleId2#roleId3$activityId2@roleId1#roleId2,guildId2->activityId1@roleId1#roleId2
     */
    const raw = env.DISCORD_CROSSPOSTER_SERVICE_ACTIVITY_ROLES_ASSOCIATIONS;
    if (raw) {
        const associations: ActivityRoleAssociations = new Map();
        const addAssociation = (guildId: string, activityId: string, roleId: string) => {
            let activity = associations.get(guildId);
            if (!activity) {
                activity = new Map<string, Set<string>>();
                associations.set(guildId, activity);
            }

            let roles = activity.get(activityId);
            if (!roles) {
                roles = new Set<string>();
                activity.set(activityId, roles);
            }

            roles.add(roleId);
        };

        const segments = raw.trim().split(',');
        for (const s of segments) {
            const [guildId, rest] = s.split('->');
            if (!DIGIT_REGEXP.test(guildId)) {
                continue;
            }

            const activities = rest.split('$');
            for (const a of activities) {
                const [activityId, rawRoleIds] = a.split('@');
                if (!DIGIT_REGEXP.test(activityId)) {
                    continue;
                }

                const roleIds = rawRoleIds.split('#');
                for (const roleId of roleIds) {
                    if (!DIGIT_REGEXP.test(roleId)) {
                        continue;
                    }

                    addAssociation(guildId, activityId, roleId);
                }
            }
        }

        return associations;
    }
}
