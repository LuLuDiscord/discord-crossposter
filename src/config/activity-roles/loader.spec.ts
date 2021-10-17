import { loadConfig } from './loader';

describe('config/activity-roles', () => {
    it('should load associations', () => {
        const key = 'DISCORD_CROSSPOSTER_SERVICE_ACTIVITY_ROLES_ASSOCIATIONS';
        // guildId1->activityId1@roleId1#roleId2#roleId3$activityId2@roleId1#roleId2,guildId2->activityId1@roleId1#roleId2
        const value = '00->01@02#03#04$05@06#07,08->09@10#11';
        const { associations } = loadConfig({ [key]: value });

        // Guild 1
        expect(associations.has('00')).toBeTruthy();
        // Activity 1
        expect(associations.get('00')?.has('01')).toBeTruthy();
        expect(associations.get('00')?.get('01')?.has('02')).toBeTruthy();
        expect(associations.get('00')?.get('01')?.has('03')).toBeTruthy();
        expect(associations.get('00')?.get('01')?.has('04')).toBeTruthy();
        // Activity 2
        expect(associations.get('00')?.has('05')).toBeTruthy();
        expect(associations.get('00')?.get('05')?.has('06')).toBeTruthy();
        expect(associations.get('00')?.get('05')?.has('07')).toBeTruthy();

        // Guild 2
        expect(associations.get('08')).toBeTruthy();
        // Activity 1
        expect(associations.get('08')?.has('09')).toBeTruthy();
        expect(associations.get('08')?.get('09')?.has('10')).toBeTruthy();
        expect(associations.get('08')?.get('09')?.has('11')).toBeTruthy();
    });
});
