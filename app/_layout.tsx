import {Slot} from 'expo-router';
import 'react-native-reanimated';

import {customDarkTheme, customLightTheme} from '@/constants/Colors';
import * as SystemUI from 'expo-system-ui';

import {useColorScheme} from 'react-native';
import {PaperProvider} from 'react-native-paper';
import {StatusBar} from 'expo-status-bar';

import {SessionProvider} from '@/hooks/authContext';

export default function Root() {
    const colorScheme = useColorScheme();

    const theme = colorScheme === 'dark' ? customDarkTheme : customLightTheme;
    SystemUI.setBackgroundColorAsync(colorScheme === 'dark' ? 'dark' : 'white')
        .then(() => console.log('Successfully set System UI Background Color: ' + colorScheme));

    return (
        <SessionProvider>
            <PaperProvider theme={theme}>
                <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'}/>
                <Slot/>
            </PaperProvider>
        </SessionProvider>
    );
}
