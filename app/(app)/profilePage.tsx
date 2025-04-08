import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Keyboard, View} from 'react-native';
import {Avatar, Button, Dialog, IconButton, Modal, Portal, Snackbar, Text, TextInput, useTheme} from 'react-native-paper';
import {CenteredView, ThemedView} from '@/components/ThemedComponents';
import {useSession} from '@/hooks/authContext';
import {fetchAvatar, fetchData} from '@/utilities/requests';
import {api_url} from '@/constants/Network';
import {profile, styles} from '@/constants/Styles';
import * as ImagePicker from 'expo-image-picker';

const passwordPattern = /^.{5,50}$/;

export default function ProfilePage() {
    const {signOut, sessionToken, id, username, isGuest} = useSession();
    const [loading, setLoading] = useState<boolean>(true);
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [passwordModalVisible, setPasswordModalVisible] = useState<boolean>(false);
    const [pictureModalVisible, setPictureModalVisible] = useState<boolean>(false);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState<boolean>(false);

    const [currentPassword, setCurrentPassword] = useState<string>('');
    const [currentPasswordError, setCurrentPasswordError] = useState<boolean>(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);

    const [newPassword, setNewPassword] = useState<string>('');
    const [newPasswordError, setNewPasswordError] = useState<boolean>(false);
    const [showNewPassword, setShowNewPassword] = useState<boolean>(false);

    const [repeatPassword, setRepeatPassword] = useState<string>('');
    const [repeatPasswordError, setRepeatPasswordError] = useState<boolean>(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState<boolean>(false);

    const [error, setError] = useState<string>('');
    const [pictureError, setPictureError] = useState<string | null>(null);
    const [snackbarMessage, setSnackbarMessage] = useState<string>('');

    const [noImage, setNoImage] = useState<boolean>(true);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageName, setImageName] = useState<string>('');
    const [imageMimeType, setImageMimeType] = useState<string | undefined>('');
    const [uploadingImage, setUploadingImage] = useState<boolean>(false);

    const theme = useTheme();

    const [buttonsVisible, setButtonsVisible] = useState<boolean>(false);

    useEffect(() => {
        if (isGuest === 'true') {
            setButtonsVisible(false);
        } else {
            setButtonsVisible(true);
        }
    }, [isGuest]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const avatar = await fetchAvatar(id, sessionToken);
                setAvatarUri(avatar);
                setLoading(false);
            } catch (error) {
                console.error('Fehler beim Abrufen der Benutzerdaten:', error);
                setLoading(false);
            }
        };

        fetchUserData();
    }, [sessionToken]);

    const handleChangePassword = async () => {
        const isPasswordValid = passwordPattern.test(currentPassword);
        const isNewPasswordValid = passwordPattern.test(newPassword);
        setCurrentPasswordError(false);
        setNewPasswordError(false);
        setRepeatPasswordError(false);

        if (currentPassword === '' || newPassword === '' || repeatPassword === '') {
            setError('Bitte fülle alle Felder aus.');
            setCurrentPasswordError(true);
            setNewPasswordError(true);
            setRepeatPasswordError(true);
            return;
        } else if (newPassword !== repeatPassword) {
            setError('Die neuen Passwörter stimmen nicht überein.');
            setNewPasswordError(true);
            setRepeatPasswordError(true);
            return;
        } else if (currentPassword === newPassword) {
            setError('Das neue Passwort und alte Passwort sind identisch.');
            setCurrentPasswordError(true);
            setNewPasswordError(true);
            setRepeatPasswordError(true);
            return;
        } else if (!isPasswordValid) {
            setError('Das aktuelle Passwort ist falsch');
            setCurrentPasswordError(true);
        } else if (!isNewPasswordValid) {
            setError('Das neue Passwort muss mindestens 5 Zeichen lang sein.');
            setNewPasswordError(true);
            setRepeatPasswordError(true);
            return;
        }

        try {
            const response = await fetchData(sessionToken, '/user/password', 'PUT', {
                old_password: currentPassword,
                new_password: newPassword,
            });

            if (!response.ok) {
                if (response.status === 406) {
                    setError('Das aktuelle Passwort ist falsch');
                    setCurrentPasswordError(true);
                }
            } else {
                setSnackbarMessage('Passwort erfolgreich geändert!');
                setPasswordModalVisible(false);
                setCurrentPassword('');
                setNewPassword('');
                setRepeatPassword('');
                setError('');
            }
        } catch (err) {
            console.error('Fehler bei der Anfrage:', err);
            setError('Ein unerwarteter Fehler ist aufgetreten.');
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync();

        if (!result.canceled) {
            console.log(result.assets[0]);
            const uri = result.assets[0].uri;
            const filename = uri.split('/').pop();
            const mimeType = result.assets[0].mimeType;

            setImageUri(uri);
            setImageName(filename || 'profile_picture.webp');
            setImageMimeType(mimeType);
            setPictureError(null);
            setNoImage(false);
        } else {
            setImageUri(null);
            setNoImage(true);
        }
    };

    const handleDeleteImage = async () => {
        try {
            const response = await fetchData(sessionToken, '/user/profile_picture', 'DELETE');

            if (response.status !== 200) {
                console.log(response);
                setSnackbarMessage('Beim Löschen des Bildes ist etwas schief gelaufen. Bitte versuche es erneut.');
            } else {
                setAvatarUri(null);
                setDeleteDialogVisible(false);
                setSnackbarMessage('Profilbild wurde gelöscht.');
            }
        } catch (error) {
            console.log('Error while deleting Image:', error);
            setSnackbarMessage('Beim Löschen des Bildes ist etwas schief gelaufen. Bitte versuche es erneut.');
            return;
        }
    };

    const handleUploadImage = async () => {
        if (imageUri) {
            const formData = new FormData();

            //@ts-ignore
            formData.append('profile_picture', {
                uri: imageUri,
                type: imageMimeType || 'image/jpeg',
                name: imageName,
            });

            setUploadingImage(true);
            try {
                const imageResponse = await fetch(api_url + `/user/profile_picture`, {
                    method: 'PUT',
                    //@ts-ignore
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': sessionToken,
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formData,
                });

                if (imageResponse.status !== 200) {
                    console.log(imageResponse);
                    setPictureError('Beim Hochladen des Bildes ist etwas schief gelaufen. Bitte versuche es erneut.');
                } else {
                    const newAvatarUri = await fetchAvatar(id, sessionToken);
                    setAvatarUri(newAvatarUri);

                    setSnackbarMessage('Bild wurde hochgeladen.');
                    setPictureModalVisible(false);
                    setPictureError(null);
                    setImageUri(null);
                    setNoImage(true);
                }
            } catch (error) {
                console.log('Error while uploading Image:', error);
                setPictureError('Beim Hochladen des Bildes ist etwas schief gelaufen. Bitte versuche es erneut. Das Bild darf maximal 10 MB groß sein.');
                return;
            } finally {
                setUploadingImage(false);
            }


        } else {
            setPictureError('Bitte wähle ein Bild zum hochladen aus.');
        }
    };

    if (loading) {
        return (
            <CenteredView>
                <ActivityIndicator animating={true} size="large"/>
            </CenteredView>
        );
    }

    return (
        <ThemedView>
            <View style={profile.upperContainer}>
                <View>
                    {avatarUri ? (
                        <View style={profile.avatarContainer}>
                            <Avatar.Image
                                // @ts-ignore
                                source={{
                                    uri: avatarUri,
                                    headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: sessionToken,
                                    },
                                }}
                                size={200}
                            />
                            <IconButton
                                icon="trash-can"
                                size={25}
                                style={profile.deleteButton}
                                containerColor={theme.colors.primary}
                                iconColor={theme.colors.onPrimary}
                                onPress={() => setDeleteDialogVisible(true)}
                            />
                        </View>
                    ) : (
                        <Avatar.Text
                            style={{backgroundColor: theme.colors.primary}}
                            label={username ? username.charAt(0).toUpperCase() : 'U'}
                            size={150}
                        />
                    )}
                </View>
                <Text style={profile.nameText}>{username ? username : 'Unbekannt'}</Text>
                {buttonsVisible ? (
                    <><Button
                        mode="contained"
                        icon="pencil"
                        style={profile.changeButton}
                        onPress={() => setPasswordModalVisible(true)}>
                        Passwort ändern
                    </Button><Button
                        mode="contained"
                        icon="camera"
                        style={profile.changeButton}
                        onPress={() => setPictureModalVisible(true)}
                    >
                        Profilbild ändern
                    </Button></>) : null}
            </View>

            <Button
                mode="outlined"
                style={profile.signOutButton}
                onPress={() => signOut()}
            >
                Abmelden
            </Button>

            {/*Password Modal*/}
            <Portal>
                <Modal
                    visible={passwordModalVisible}
                    onDismiss={() => {
                        setPasswordModalVisible(false);
                        setCurrentPasswordError(false);
                        setNewPasswordError(false);
                        setRepeatPasswordError(false);
                        setError('');
                    }}
                    contentContainerStyle={[profile.modalContainer, {backgroundColor: theme.colors.background}]}
                >
                    <Text style={profile.modalTitle}>Passwort ändern</Text>
                    <TextInput
                        label="Aktuelles Passwort"
                        mode="outlined"
                        onChangeText={setCurrentPassword}
                        style={styles.input}
                        secureTextEntry={!showCurrentPassword}
                        error={currentPasswordError}
                        right={
                            <TextInput.Icon
                                icon={showCurrentPassword ? 'eye-off' : 'eye'}
                                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                            />
                        }
                    />
                    <TextInput
                        label="Neues Passwort"
                        mode="outlined"
                        onChangeText={setNewPassword}
                        style={styles.input}
                        secureTextEntry={!showNewPassword}
                        error={newPasswordError}
                        right={
                            <TextInput.Icon
                                icon={showNewPassword ? 'eye-off' : 'eye'}
                                onPress={() => setShowNewPassword(!showNewPassword)}
                            />
                        }
                    />
                    <TextInput
                        label="Passwort bestätigen"
                        mode="outlined"
                        onChangeText={setRepeatPassword}
                        style={styles.input}
                        error={repeatPasswordError}
                        secureTextEntry={!showRepeatPassword}
                        right={
                            <TextInput.Icon
                                icon={showRepeatPassword ? 'eye-off' : 'eye'}
                                onPress={() => setShowRepeatPassword(!showRepeatPassword)}
                            />
                        }
                    />
                    {error ? <Text style={[profile.modalErrorText, {color: theme.colors.error}]}>{error}</Text> : null}
                    <Button
                        mode="contained"
                        onPress={() => {
                            Keyboard.dismiss();
                            handleChangePassword();
                        }}
                        style={profile.modalButton}
                    >
                        Passwort ändern
                    </Button>
                </Modal>
            </Portal>

            {/*Delete Picture Dialog*/}
            <Portal>
                <Dialog visible={deleteDialogVisible} dismissable={false}>
                    <Dialog.Title>Profilbild entfernen</Dialog.Title>
                    <Dialog.Content>
                        <Text>Willst du dein Profilbild wirklich entfernen?</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setDeleteDialogVisible(false)}>Nein</Button>
                        <Button onPress={() => handleDeleteImage()}>Ja</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            {/*Profile Picture Modal*/}
            <Portal>
                <Modal
                    visible={pictureModalVisible}
                    onDismiss={() => {
                        setPictureModalVisible(false);
                        setPictureError(null);
                        setImageUri(null);
                    }}
                    contentContainerStyle={[profile.modalContainer, {backgroundColor: theme.colors.background}]}>
                    {imageUri && (
                        <View style={{alignItems: 'center', paddingTop: 10, paddingBottom: 15}}>
                            <Avatar.Image
                                source={{
                                    uri: imageUri,
                                }}
                                size={200}
                            />
                        </View>
                    )}
                    {uploadingImage && (
                        <View style={{alignItems: 'center', paddingBottom: 15}}>
                            <ActivityIndicator animating={true} size="large" color={theme.colors.primary}/>
                        </View>
                    )}
                    <Button
                        mode="outlined"
                        onPress={pickImage}
                    >
                        Bild auswählen
                    </Button>
                    {pictureError && <Text style={profile.modalErrorText}>{pictureError}</Text>}
                    <Button
                        mode="contained"
                        onPress={handleUploadImage}
                        style={profile.modalButton}
                        disabled={noImage || uploadingImage}
                    >
                        Auswahl bestätigen
                    </Button>
                </Modal>
            </Portal>

            <View style={profile.pwdSnackbar}>
                <Snackbar
                    visible={!!snackbarMessage}
                    onDismiss={() => setSnackbarMessage('')}
                    duration={3000}
                    action={{
                        label: 'OK',
                        onPress: () => setSnackbarMessage(''),
                    }}
                >
                    {snackbarMessage}
                </Snackbar>
            </View>
        </ThemedView>
    );
}
