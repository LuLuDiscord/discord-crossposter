export type ActivityRoleAssociations = Map<string, Map<string, Set<string>>>;

export interface IServiceConfigActivityRoles {
    readonly associations: ActivityRoleAssociations;
}
