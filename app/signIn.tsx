import React, {useState} from 'react';
import {Image, Keyboard, View} from 'react-native';
import {Button, Snackbar, Text, TextInput} from 'react-native-paper';
import {router} from 'expo-router';
import {useSession} from '@/hooks/authContext';
import {CenteredView} from '@/components/ThemedComponents';
import {styles} from '@/constants/Styles';


export default function signIn() {
    const {signIn, guestSignIn} = useSession();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [guestLoginLoading, setGuestLoginLoading] = useState(false);
    const [error, setError] = useState('');


    const handleLogIn = async () => {

        Keyboard.dismiss();

        if (username === '' || password === '') {
            setError('Bitte Nutzername und Passwort angeben.');
            return;
        }

        setLoading(true);

        try {
            await signIn(username, password);

            router.replace('/');


        } catch (error: any) {
            if (error.message === '406' || error.message === '404' || error.message === '422') {
                setError('Anmeldung fehlgeschlagen. Bitte überprüfe Benutzername und Passwort.');
            } else {
                setError('Anmeldung fehlgeschlagen. Bitte versuche es später erneut.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogInAsGuest = async () => {

        setGuestLoginLoading(true);

        try {
            await guestSignIn();
            router.replace('/');

        } catch (error: any) {
            setError('Anmeldung fehlgeschlagen. Bitte versuche es später erneut.');
        } finally {
            setGuestLoginLoading(false);
        }
    };


    return (
        <CenteredView style={{padding: 20}}>
            <Image source={require('../assets/images/icon.png')} style={styles.logo}/>
            <Text style={styles.title}>Login</Text>
            <View style={styles.registerLine}>
                <Text style={styles.text}>Noch keinen Account?</Text>
                <Button
                    mode="text"
                    onPress={() => router.push('/register')}
                    style={styles.registerButton}
                >Jetzt Registrieren
                </Button>
            </View>
            <TextInput
                label="Nutzername"
                mode={'outlined'}
                value={username}
                onChangeText={setUsername}
                style={styles.input}
            />
            <TextInput
                label="Passwort"
                mode={'outlined'}
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry={!showPassword}
                right={
                    <TextInput.Icon
                        icon={showPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowPassword(!showPassword)}
                    />
                }
            />
            <Button
                mode="contained"
                onPress={handleLogIn}
                loading={loading}
                disabled={loading}
                style={styles.signInButton}
            >
                {loading ? 'wird angemeldet...' : 'Anmelden'}
            </Button>
            <Button
                mode="contained"
                onPress={handleLogInAsGuest}
                disabled={guestLoginLoading}
                loading={guestLoginLoading}
                style={styles.signInButton}
            >
                {guestLoginLoading ? 'wird als Gast angemeldet...' : 'Als Gast anmelden'}
            </Button>
            <View style={styles.dividerView}/>
            <Snackbar
                duration={4000000}
                visible={!!error}
                onDismiss={() => setError('')}
                action={{
                    label: 'OK',
                    onPress: () => {
                        setError('');
                    },
                }}
            >
                {error}
            </Snackbar>
        </CenteredView>
    );
}
