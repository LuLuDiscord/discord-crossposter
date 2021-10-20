export type RoleID = string;

export interface IActivityRolesLogic {
    getRoles(guildId: string, activityId: string): Generator<RoleID>;
}

export interface IActivityRolesLogicOptions {
    associations: Map<string, Map<string, Set<RoleID>>>;
}

export class ActivityRolesLogic implements IActivityRolesLogic {
    protected _associations: Map<string, Map<string, Set<RoleID>>>;

    public constructor({ associations }: IActivityRolesLogicOptions) {
        this._associations = new Map(
            [...associations.entries()].map(([guildId, games]) => {
                return [
                    guildId,
                    new Map(
                        [...games.entries()].map(([game, roles]) => {
                            return [game.toLowerCase(), roles];
                        })
                    ),
                ];
            })
        );
    }

    public *getRoles(guildId: string, name: string) {
        const games = this._associations.get(guildId);
        if (!games) {
            return;
        }

        name = name.toLowerCase();
        for (const [game, roles] of games.entries()) {
            if (name.includes(game)) {
                yield* roles.values();
            }
        }
    }
}
