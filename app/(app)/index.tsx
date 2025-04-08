import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {Keyboard, TouchableOpacity, TouchableWithoutFeedback, View} from 'react-native';
import {Avatar, Button, IconButton, SegmentedButtons, Text, useTheme} from 'react-native-paper';
import {router, useFocusEffect, useLocalSearchParams, useNavigation} from 'expo-router';
import {codeFieldStyles, landingpage, styles} from '@/constants/Styles';
import {CenteredView} from '@/components/ThemedComponents';
import {useSession} from '@/hooks/authContext';
import {fetchAvatar, fetchData} from '@/utilities/requests';
import {api_url, ws_url} from '@/constants/Network';
import {GameResponse} from '@/constants/Interfaces';
import {CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell} from 'react-native-confirmation-code-field';

const CELL_COUNT = 6;

export default function HomeScreen() {
    const {sessionToken, username, id} = useSession();
    const [gameCode, setGameCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [selectedGame, setSelectedGame] = useState<string>('');
    const navigation = useNavigation();
    const theme = useTheme();
    const instajoin = useLocalSearchParams().instajoinGame;
    // const [jackSelection, setJackSelection] = useState<number | null>(null);

    const ref = useBlurOnFulfill({value: gameCode, cellCount: CELL_COUNT});
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({value: gameCode, setValue: setGameCode});


    const errorMapping: { [key: string]: string } = {
        'game_already_started': 'Das Spiel ist bereits gestartet.',
        'game_full': 'Das Spiel ist bereits voll.',
    };

    const gamePageMapping: { [key: string]: string } = {
        'maumau': 'MauGameView',
        'lügen': 'LuegenGameView',
    };

    const fetchUserData = useCallback(async () => {
        const response = await fetch(api_url + `/user/${id}`, {
            method: 'GET',
            // @ts-ignore
            headers: {
                'Authorization': sessionToken,
                'Content-Type': 'application/json',
            },
        });
        if (response.status === 401) {
            console.log('Token invalid');
            router.replace('/signIn');
        } else {
            const avatar = await fetchAvatar(id, sessionToken);
            setAvatarUri(avatar);
        }
    }, [id, sessionToken]);

    useFocusEffect(
        useCallback(() => {
            fetchUserData();
        }, [fetchUserData]),
    );

    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <IconButton
                    icon="clipboard-text-outline"
                    size={40}
                    onPressIn={() => router.push('/rulePage')}
                    style={styles.headerLeft}
                    iconColor={theme.colors.primary}
                />
            ),
            headerRight: () => (
                <TouchableOpacity onPressIn={() => router.push('/profilePage')}>
                    {avatarUri ? (
                        <Avatar.Image
                            //@ts-ignore
                            source={{
                                uri: avatarUri,
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': sessionToken,
                                },
                            }}
                            size={40}
                            style={styles.headerRight}
                        />
                    ) : (
                        <Avatar.Text
                            //@ts-ignore
                            label={username?.charAt(0).toUpperCase()}
                            size={40}
                            style={[styles.headerRight, {backgroundColor: theme.colors.primary}]}
                        />
                    )}
                </TouchableOpacity>
            ),
        });
    }, [navigation, avatarUri, username, theme.colors.primary]);

    const fetchGameId = async (gameCode: string | null) => {
        try {
            Keyboard.dismiss();
            setTimeout(() => {
                setError(null);
            }, 3000); // 3000 ms = 3 Sekunden
            setLoading(true);

            const response = await fetchData(sessionToken, '/game/' + gameCode?.toLowerCase().trim());

            const data: GameResponse = await response.json();

            connectToGameLobby(data);
        } catch (error) {
            setError('Ungültige Raum-ID. Bitte versuchen Sie es erneut.');
        } finally {
            setLoading(false);
        }
    };

    const connectToGameLobby = (gameParameters: GameResponse) => {
        const wsRequest = ws_url + `/game/ws/${gameParameters.id}?token=${sessionToken}`;
        const webSocket = new WebSocket(wsRequest);

        webSocket.onopen = () => {
            webSocket.send('{"action" : "join"}');
        };

        webSocket.onerror = (error) => {
            console.log('WebSocket-Fehler: ', error);
        };

        webSocket.onmessage = (event) => {
            const messageJSON = JSON.parse(event.data);

            if (messageJSON['action'] == 'join') {
                webSocket.close();
                router.replace({pathname: '/gameLobby', params: {gameParameters: JSON.stringify(gameParameters)}});
            }
            //regular errors without possible rejoin
            if (messageJSON['error'] && errorMapping[messageJSON['error']]) {
                setError('Fehler beim Beitritt zum Spiel: ' + errorMapping[messageJSON['error']]);
                webSocket.close();
                console.log('Websocket closed due to join error.');
            }

            //if player already joined, try to determine if the game started by getting the game data
            if (messageJSON['error'] === 'player_already_joined') {
                webSocket.send('{"action" : "request_game_data"}');
            }

            //redirect to lobby if the game is not started
            if (messageJSON['error'] === 'game_not_started') {
                webSocket.close();
                router.replace({pathname: '/gameLobby', params: {gameParameters: JSON.stringify(gameParameters)}});
            }

            //redirect to game view if game_data can be retrieved
            if (messageJSON['action'] === 'game_data') {
                webSocket.close();

                router.replace({
                    //@ts-ignore
                    pathname: gamePageMapping[gameParameters.type],
                    params: {
                        roomid: gameParameters.id,
                        roomcode: gameParameters.code,
                        gamemode: gameParameters.gamemode,
                        deck_size: gameParameters.deck_size,
                    },
                });
            }

        };
    };

    useEffect(() => {
        if (instajoin != null) {
            connectToGameLobby(JSON.parse(instajoin as string));
        }
    }, []);


    return (
        <CenteredView style={landingpage.homeView}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View style={landingpage.innerHomeView}>
                    <Text variant={'headlineLarge'} style={landingpage.welcomeText}>
                        Willkommen <Text style={styles.textBold}>{username}</Text>
                    </Text>

                    <Text variant={'headlineMedium'} style={styles.textBold}>
                        Raum-ID
                    </Text>

                    {/*@ts-ignore*/}
                    <CodeField
                        ref={ref}
                        {...props}
                        value={gameCode}
                        onChangeText={setGameCode}
                        cellCount={CELL_COUNT}
                        rootStyle={codeFieldStyles.codeFieldRoot}
                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                        testID="my-code-input"
                        renderCell={({index, symbol, isFocused}) => (
                            <Text
                                key={index}
                                style={[codeFieldStyles.cell, {borderColor: theme.colors.primary}]}
                                onLayout={getCellOnLayoutHandler(index)}>
                                {symbol || (isFocused ? <Cursor/> : null)}
                            </Text>
                        )}
                    />
                    {error ? <Text style={{color: theme.colors.error, fontSize: 12}}>{error}</Text> : null}
                    <Button
                        mode="contained"
                        onPress={() => fetchGameId(gameCode)}
                        loading={loading}
                        disabled={gameCode.length !== CELL_COUNT || loading}
                        style={landingpage.enterRoomBtn}>
                        {loading ? 'Raum wird beigetreten...' : 'Beitreten'}
                    </Button>

                    <Text variant={'headlineMedium'} style={styles.textBold}>
                        Raum Erstellen
                    </Text>

                    {/*@ts-ignore*/}
                    <SegmentedButtons
                        value={selectedGame} // Kein ausgewählter Button
                        onValueChange={setSelectedGame}
                        style={landingpage.gameSelectionButtonSegment}
                        theme={{colors: {primary: 'green'}}}
                        buttons={[
                            // @ts-ignore
                            {
                                label: 'Mau Mau',
                                labelStyle: {...landingpage.gameSelectionButtonText},
                                style: {...landingpage.gameSelectionButton, backgroundColor: theme.colors.background},
                                onPress: () => router.push('/newMauGame'),
                            },
                            // @ts-ignore
                            {
                                label: 'Lügen',
                                labelStyle: {...landingpage.gameSelectionButtonText},
                                style: {...landingpage.gameSelectionButton, backgroundColor: theme.colors.background},
                                onPress: () => router.push('/newLuegenGame'),
                                disabled: false,
                            },
                        ]}
                    />
                </View>
            </TouchableWithoutFeedback>
        </CenteredView>
    );
}
