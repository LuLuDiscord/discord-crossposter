export type RoleID = string;

export interface IActivityRolesLogic {
    getRoles(guildId: string, activityId: string): Generator<RoleID>;
}

export interface IActivityRolesLogicOptions {
    associations: Map<string, Map<string, Set<RoleID>>>;
}

export class ActivityRolesLogic implements IActivityRolesLogic {
    protected _associations: Map<string, Map<string, Set<RoleID>>>;

    public constructor({ associations: roles }: IActivityRolesLogicOptions) {
        this._associations = roles;
    }

    public *getRoles(guildId: string, activityId: string) {
        const games = this._associations.get(guildId);
        if (!games) {
            return;
        }

        const roles = games.get(activityId);
        if (!roles) {
            return;
        }

        yield* roles.values();
    }
}
