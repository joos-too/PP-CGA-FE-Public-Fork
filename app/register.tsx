import React, {useState} from 'react';
import {router} from 'expo-router';
import {Image, Keyboard, View} from 'react-native';
import {useSession} from '@/hooks/authContext';
import {Button, Snackbar, Text, TextInput} from 'react-native-paper';
import {CenteredView} from '@/components/ThemedComponents';
import {styles} from '@/constants/Styles';

// Regex patterns for validation
const usernamePattern = /^[a-zA-Z0-9_-ßöäüÖÄÜ]{3,50}$/;
const passwordPattern = /^.{5,50}$/;

export default function Register() {
    const {register} = useSession();
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [usernameError, setUsernameError] = useState<boolean>(false);
    const [passwordError, setPasswordError] = useState<boolean>(false);

    const handleRegister = async () => {
        setUsernameError(false);
        setPasswordError(false);
        setError('');
        Keyboard.dismiss();

        const isUsernameValid = usernamePattern.test(username);
        const isPasswordValid = passwordPattern.test(password);

        if (!isUsernameValid && !isPasswordValid) {
            setError('Nutzername und Password müssen mindestens 3 bzw. 5 Zeichen lang sein und der Nutzername darf nur Buchstaben, Zahlen und Unter-/Bindestriche enthalten.');
            setUsernameError(true);
            setPasswordError(true);
            return;
        } else if (!isUsernameValid) {
            setUsernameError(true);
            setError('Der Nutzername muss mindestens 3 Zeichen lang sein und darf nur Buchstaben, Zahlen und Unter-/Bindestriche enthalten.');
            return;
        } else if (!isPasswordValid) {
            setPasswordError(true);
            setError('Das Passwort muss mindestens 5 Zeichen lang sein.');
            return;
        }

        setLoading(true);

        try {
            await register(username, password);
            router.replace('/');
        } catch (error: any) {
            if (error.message === '400') {
                setError('Registrierung fehlgeschlagen. Bitte wähle einen anderen Nutzernamen.');
            } else {
                setError('Registrierung fehlgeschlagen. Bitte versuche es später erneut.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <CenteredView style={{padding: 20}}>
            <Image source={require('@/assets/images/icon.png')} style={styles.logo}/>
            <Text style={styles.title}>Registrierung</Text>
            <TextInput
                label="Nutzername"
                mode={'outlined'}
                value={username}
                onChangeText={setUsername}
                style={styles.input}
                error={usernameError}
            />
            <TextInput
                label="Passwort"
                mode={'outlined'}
                error={passwordError}
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
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
                style={styles.signInButton}
            >
                {loading ? 'wird registriert...' : 'Registrieren'}
            </Button>

            <Button
                mode="text"
                onPress={() => router.replace('/signIn')}
                style={styles.registerButton}
            >
                Zurück zum Login
            </Button>
            <View style={styles.dividerView}/>
            <Snackbar
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
