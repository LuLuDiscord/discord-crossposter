import type { RoleID } from './logic';
import { ActivityRolesLogic } from './logic';

describe('Modules/ActivityRoles/Logic', () => {
    it('Should match all of these games', () => {
        const guildId = '105753365916422144';
        const game = 'Apex Legends';
        const roleId = '12121221';
        const associations = new Map<string, Map<string, Set<RoleID>>>([
            [guildId, new Map([[game, new Set<RoleID>([roleId])]])],
        ]);
        const logic = new ActivityRolesLogic({ associations });

        expect([...logic.getRoles(guildId, 'Minecraft')]).toHaveLength(0);
        expect([...logic.getRoles(guildId, 'Apex Legends')]).toHaveLength(1);
        expect([...logic.getRoles(guildId, 'Apex Legends™️')]).toHaveLength(1);
        expect([...logic.getRoles(guildId, 'Apex Legends™️ sur GeForce Now')]).toHaveLength(1);
    });
});
