import type * as Discord from 'discord.js';

import type { IModule } from '../../module';
import { Module } from '../../module';
import type { IActivityRolesLogic, IActivityRolesLogicOptions } from './logic';
import { ActivityRolesLogic } from './logic';
import * as Metrics from './metrics';

export class ActivityRolesModule extends Module implements IModule {
    protected logic: IActivityRolesLogic;

    public constructor(client: Discord.Client, options: IActivityRolesLogicOptions) {
        super(client);
        this.logic = new ActivityRolesLogic(options);
        this._init();
    }

    public destroy(): void {
        this._client.off('ready', this._onReady);
        this._client.off('presenceUpdate', this._onPresence);
    }

    private _init() {
        this._client.on('ready', this._onReady);
    }

    private _onReady = async () => {
        this._client.on('presenceUpdate', this._onPresence);

        for (const guild of this._client.guilds.cache.values()) {
            let roles: Discord.Collection<string, Discord.Role> | undefined;
            try {
                roles = await guild.roles.fetch(undefined, { cache: true });
            } catch (err) {
                const guildStr = `guild '${guild.name}' (${guild.id})`;
                console.error(`Error fetching roles for ${guildStr}: ${(err as Error).stack}`);
            }

            for (const member of guild.members.cache.values()) {
                const presence = member.presence;
                if (!presence) {
                    continue;
                }

                await this._processGuild(guild, roles, presence);
            }
        }
    };

    private _onPresence = async (old: Discord.Presence | null, presence: Discord.Presence) => {
        for (const guild of this._client.guilds.cache.values()) {
            let roles: Discord.Collection<string, Discord.Role> | undefined;
            try {
                roles = await guild.roles.fetch(undefined, { cache: true });
            } catch (err) {
                const guildStr = `guild '${guild.name}' (${guild.id})`;
                console.error(`Error fetching roles for ${guildStr}: ${(err as Error).stack}`);
            }

            await this._processGuild(guild, roles, presence);
            Metrics.PRESENCE_CHANGES.inc({ guild_id: guild.id });
        }
    };

    private async _processGuild(
        guild: Discord.Guild,
        roles: Discord.Collection<string, Discord.Role> | undefined,
        presence: Discord.Presence
    ): Promise<void> {
        const guildStr = `guild '${guild.name}' (${guild.id})`;

        /**
         * XXX
         * Note (Lewis): Some of this logic can be migrated and abstracted
         * to the logic implementation in this directory.
         *
         * Looping over known guildIds from the configuration should be considered
         * for scalability in the future.
         */

        /* We must know about the user. */
        const user = presence.user;
        if (!user) {
            // console.warn(`Unable to process presence update in ${guildStr} - no user cached.`);
            return;
        }

        /* They must be in the guild. */
        const member = guild.members.cache.get(user.id);
        if (!member) {
            // console.warn(`Unable to process presence update in ${guildStr} - no member cached.`);
            return;
        }
        const memberStr = `member ${member.user.tag} (${member.id})`;

        const rolesToAdd = new Map<string, Discord.Activity>();
        for (const activity of presence.activities.values()) {
            if (activity.type !== 'PLAYING') {
                continue;
            }

            /* Add any roles to the grant set if any are specified for this activity */
            for (const roleId of this.logic.getRoles(guild.id, activity.name)) {
                /* Skip if the member has this role already. */
                if (member.roles.cache.has(roleId)) {
                    continue;
                }
                if (rolesToAdd.has(roleId)) {
                    continue;
                }
                rolesToAdd.set(roleId, activity);
                if (rolesToAdd.size === 1) {
                    console.log(`Activity '${activity.name}' is being played by ${memberStr} in ${guildStr}.`);
                }
            }
        }

        /* Grant roles if any are specified. */
        if (rolesToAdd.size) {
            const roleIdsToAdd = [...rolesToAdd.keys()];
            const roleStr = [...rolesToAdd.entries()]
                .map(([roleId, activity]) => {
                    let name = 'N/A';
                    if (roles) {
                        const role = roles.get(roleId);
                        if (role) {
                            name = role.name;
                        }
                    }
                    return `'${name}' (${roleId}) [${activity.name}]`;
                })
                .join(', ');

            try {
                console.warn(`Attempting to grant roles ${roleStr} to ${memberStr} in ${guildStr}.`);
                await member.fetch(false);
                await member.roles.add(roleIdsToAdd);
                console.warn(`Successfully granted roles ${roleStr} to ${memberStr} in ${guildStr}.`);
            } catch (err) {
                console.warn(
                    `An error occured granting roles ${roleStr} to ${memberStr} in ${guildStr}: ${(err as Error).stack}`
                );
                return;
            }

            /* Increment metrics. */
            for (const [roleId, activity] of rolesToAdd.entries()) {
                Metrics.ROLES_ISSUED.inc({
                    activity_name: activity.name,
                    guild_id: guild.id,
                    role_id: roleId,
                });
            }
        }

        // console.info(`Successfully processed presence changes for ${memberStr} in ${guildStr}.`);
    }
}
