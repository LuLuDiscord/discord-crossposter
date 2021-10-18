import { loadConfig } from './loader';

describe('config/activity-roles', () => {
    it('should parse a single associations', () => {
        const key = 'DISCORD_CROSSPOSTER_SERVICE_ACTIVITY_ROLES_ASSOCIATIONS';
        // guildId1->activityId1@roleId1#roleId2#roleId3$activityId2@roleId1#roleId2,guildId2->activityId1@roleId1#roleId2
        const value = '00->Valorant@02';
        const { associations } = loadConfig({ [key]: value });

        // Guild 1
        expect(associations.has('00')).toBeTruthy();
        // Activity 1
        expect(associations.get('00')?.has('Valorant')).toBeTruthy();
        expect(associations.get('00')?.get('Valorant')?.has('02')).toBeTruthy();
    });

    it('should parse multiple associations', () => {
        const key = 'DISCORD_CROSSPOSTER_SERVICE_ACTIVITY_ROLES_ASSOCIATIONS';
        // guildId1->activityId1@roleId1#roleId2#roleId3$activityId2@roleId1#roleId2,guildId2->activityId1@roleId1#roleId2
        const value = '00->Valorant@02#03#04$Apex Legends@06#07,08->COD: Warzone@10#11';
        const { associations } = loadConfig({ [key]: value });

        // Guild 1
        expect(associations.has('00')).toBeTruthy();
        // Activity 1
        expect(associations.get('00')?.has('Valorant')).toBeTruthy();
        expect(associations.get('00')?.get('Valorant')?.has('02')).toBeTruthy();
        expect(associations.get('00')?.get('Valorant')?.has('03')).toBeTruthy();
        expect(associations.get('00')?.get('Valorant')?.has('04')).toBeTruthy();
        // Activity 2
        expect(associations.get('00')?.has('Apex Legends')).toBeTruthy();
        expect(associations.get('00')?.get('Apex Legends')?.has('06')).toBeTruthy();
        expect(associations.get('00')?.get('Apex Legends')?.has('07')).toBeTruthy();

        // Guild 2
        expect(associations.get('08')).toBeTruthy();
        // Activity 1
        expect(associations.get('08')?.has('COD: Warzone')).toBeTruthy();
        expect(associations.get('08')?.get('COD: Warzone')?.has('10')).toBeTruthy();
        expect(associations.get('08')?.get('COD: Warzone')?.has('11')).toBeTruthy();
    });
});
