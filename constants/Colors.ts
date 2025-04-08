// React Native Paper Themes for general Colors, Buttons, UI Elements etc.
// see https://callstack.github.io/react-native-paper/docs/guides/theming/
import {DefaultTheme, MD3DarkTheme} from 'react-native-paper';

export const customLightTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#7A73D1',
        onPrimary: '#fff',
        primaryContainer: '#7A73D1',
        onPrimaryContainer: '#fff',
        surfaceVariant: '', // needed for input fields
        touchable: '#eef',
        gameCodeButton: '#dcdcdc',
        gameCodeBackground: '#d5d5d5',
        lobbyReady: '#00c12d',
        lobbyUnready: '#8d8d8d',
        lobbyLeave: '#ff0000',
    },
};

export const customDarkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: '#ffffff',
        onPrimary: '#000',
        primaryContainer: '#fff',
        onPrimaryContainer: '#000',
        surfaceVariant: '', // needed for input fields
        touchable: '#000',
        gameCodeButton: '#434343',
        gameCodeBackground: '#5e5e5e',
        lobbyReady: '#00c831',
        lobbyUnready: '#9c9c9c',
        lobbyLeave: '#ec3535',
    },
};

export const custom = {
    colors: {
        purple: '#7A73D1',
        lightPurple: '#9c8bd6',
        gameGreen: '#2a9e30',
        gameRed: '#cc3030',
        qrCodeTop: '#7d00af',
        qrCodeBottom: '#7A73D1',
    },
};
