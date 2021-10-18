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
        this._client.on('presenceUpdate', this._onPresence);
    }

    private _onReady = async () => {
        for (const guild of this._client.guilds.cache.values()) {
            for (const member of guild.members.cache.values()) {
                const presence = member.presence;
                if (!presence) {
                    continue;
                }

                await this._processGuild(guild, presence);
            }
        }
    };

    private _onPresence = async (old: Discord.Presence | null, presence: Discord.Presence) => {
        for (const guild of this._client.guilds.cache.values()) {
            await this._processGuild(guild, presence, true);
            Metrics.PRESENCE_CHANGES.inc({ guild_id: guild.id });
        }
    };

    private async _processGuild(guild: Discord.Guild, presence: Discord.Presence, log = false): Promise<void> {
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
            console.warn(`Unable to process presence update in ${guildStr} - no user cached.`);
            return;
        }

        /* They must be in the guild. */
        const member = guild.members.cache.get(user.id);
        if (!member) {
            console.warn(`Unable to process presence update in ${guildStr} - no member cached.`);
            return;
        }
        const memberStr = `member ${member.user.tag} (${member.id})`;

        const roles = new Set<string>();
        for (const activity of presence.activities.values()) {
            console.log(
                `Activity ${activity.id} (${activity.name}) is being ${activity.type} by ${memberStr} in ${guildStr}.`
            );

            /* Add any roles to the grant set if any are specified for this activity */
            for (const roleId of this.logic.getRoles(guild.id, activity.id)) {
                /* Skip if the member has this role already. */
                if (member.roles.cache.has(roleId)) {
                    continue;
                }
                roles.add(roleId);
            }
        }

        /* Grant roles if any are specified. */
        if (roles.size) {
            const roleStr = [...roles.values()].join(', ');
            try {
                console.warn(`Attempting to grant roles ${roleStr} to ${memberStr} in ${guildStr}.`);
                await member.roles.add([...roles.values()]);
                console.warn(`Successfully granted roles ${roleStr} to ${memberStr} in ${guildStr}.`);
            } catch (err) {
                console.warn(
                    `An error occured granting roles ${roleStr} to ${memberStr} in ${guildStr}: ${(err as Error).stack}`
                );
                return;
            }

            /* Increment metrics. */
            for (const roleId of roles.values()) {
                Metrics.ROLES_ISSUED.inc({
                    guild_id: guild.id,
                    role_id: roleId,
                });
            }
        }

        if (log) {
            console.info(`Successfully processed presence changes for ${memberStr} in ${guildStr}.`);
        }
    }
}
