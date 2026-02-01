import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.redemptionrp.app',
    appName: 'Redemption RP',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    }
};

export default config;
