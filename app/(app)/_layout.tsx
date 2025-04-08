import {Text} from 'react-native';
import {Redirect, Stack} from 'expo-router';
import {useSession} from '@/hooks/authContext';
import {useTheme} from 'react-native-paper';

export default function AppLayout() {
    const {sessionToken, isLoading} = useSession();
    const theme = useTheme();


    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    if (!sessionToken) {
        return <Redirect href="/signIn"/>;
    }

    return (
        <Stack
            screenOptions={{
                headerStyle: {backgroundColor: theme.colors.background},
                headerTintColor: theme.colors.onBackground,
                headerTitleAlign: 'center',
                headerTitleStyle: {fontSize: 30},
            }}
        >
            <Stack.Screen name="index" options={{title: 'Kartenspiele', headerShown: true}}/>
            <Stack.Screen name="newMauGame"
                          options={{
                              title: 'Mau Mau',
                              headerShown: true,
                          }}
            />
            <Stack.Screen name="newLuegenGame"
                          options={{
                              title: 'Lügen',
                              headerShown: true,
                          }}
            />
            <Stack.Screen name="gameLobby"
                          options={{
                              headerShown: true,
                          }}
            />
            <Stack.Screen name="rulePage"
                          options={{
                              title: 'Regeln',
                              headerShown: true,
                          }}
            />
            <Stack.Screen
                name="profilePage"
                options={{
                    title: 'Profil',
                    headerShown: true,
                }}
            />
            <Stack.Screen name="MauGameView"
                          options={{
                              headerShown: false,
                          }}
            />
            <Stack.Screen name="LuegenGameView"
                          options={{
                              headerShown: false,
                          }}
            />
        </Stack>
    );
}
