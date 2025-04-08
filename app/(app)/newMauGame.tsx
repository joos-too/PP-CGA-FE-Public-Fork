import {TouchableOpacity, Vibration as SatisfyerProTwo, View} from 'react-native';
import {router} from 'expo-router';
import {Button, Divider, Provider, Text, useTheme} from 'react-native-paper';
import React, {useCallback, useState} from 'react';
import {CenteredView} from '@/components/ThemedComponents';
import {styles} from '@/constants/Styles';
import {custom} from '@/constants/Colors';
import {useSession} from '@/hooks/authContext';
import {fetchData} from '@/utilities/requests';
import {ws_url} from '@/constants/Network';
import {GameResponse} from '@/constants/Interfaces';

const newMauGame = () => {
    const theme = useTheme();
    const {sessionToken} = useSession();
    const [loading, setLoading] = useState(false);

    // Constants for hand and deck size
    const MIN_HAND_SIZE = 5;
    const MAX_HAND_SIZE = 10;
    const DEFAULT_HAND_SIZE = 7;
    const DECK_SIZES = [32, 52, 64, 104];
    const DECK_NAMES = ['Skat', 'Rommé', 'Doppel Skat', 'Doppel Rommé'];

    // State for hand and deck size
    const [deckName, setDeckName] = useState<string>(DECK_NAMES[1]);
    const [deckSize, setDeckSize] = useState<number>(DECK_SIZES[1]);
    const isDeckSizeIncrementDisabled = DECK_SIZES.indexOf(deckSize) === DECK_SIZES.length - 1;
    const isDeckSizeDecrementDisabled = DECK_SIZES.indexOf(deckSize) === 0;

    const [handSize, setHandSize] = useState<number>(DEFAULT_HAND_SIZE);
    const isHandSizeIncrementDisabled = handSize >= MAX_HAND_SIZE;
    const isHandSizeDecrementDisabled = handSize <= MIN_HAND_SIZE;

    const incrementHandSize = useCallback(() => {

        setHandSize((prevHandSize) => {
            if (prevHandSize + 1 <= MAX_HAND_SIZE) {
                SatisfyerProTwo.vibrate(100);
                return prevHandSize + 1;
            }
            return prevHandSize;
        });
    }, []);

    const decrementHandSize = useCallback(() => {

        setHandSize((prevHandSize) => {

            if (prevHandSize - 1 >= MIN_HAND_SIZE) {
                SatisfyerProTwo.vibrate(100);
                return prevHandSize - 1;
            }
            return prevHandSize;
        });
    }, []);

    const incrementDeckSize = useCallback(() => {
        setDeckSize((prevDeckSize) => {
            if (DECK_SIZES.indexOf(prevDeckSize) < DECK_SIZES.length - 1) {
                SatisfyerProTwo.vibrate(100);
                setDeckName(DECK_NAMES[DECK_SIZES.indexOf(prevDeckSize) + 1]);
                return DECK_SIZES[DECK_SIZES.indexOf(prevDeckSize) + 1];
            }
            return prevDeckSize;
        });
    }, []);

    const decrementDeckSize = useCallback(() => {
        setDeckSize((prevDeckSize) => {
            if (DECK_SIZES.indexOf(prevDeckSize) > 0) {
                SatisfyerProTwo.vibrate(100);
                setDeckName(DECK_NAMES[DECK_SIZES.indexOf(prevDeckSize) - 1]);
                return DECK_SIZES[DECK_SIZES.indexOf(prevDeckSize) - 1];
            }
            return prevDeckSize;
        });
    }, []);


    const createGame = async () => {
        setLoading(true);
        try {
            const response = await fetchData(sessionToken, '/game', 'POST', {
                type: 'maumau',
                number_of_start_cards: handSize,
                deck_size: deckSize,
                gamemode: 'gamemode_classic',
            });

            const data = await response.json();
            console.log(data);
            connectToGameLobby(data);
        } catch (error) {
            console.error(error ? `Error: ${error}` : 'Error: unknown');
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
                router.replace({pathname: '/gameLobby', params: {gameParameters: JSON.stringify(gameParameters)}});
            }
            if (messageJSON['error'] == 'game_already_started' || messageJSON['error'] == 'game_full' || messageJSON['error'] == 'player_already_joined') {
                console.log('Fehler beim Beitritt zum Spiel: ' + messageJSON['error']);
                webSocket.close();
                console.log('Websocket closed due to join error.');
            }


        };
    };


    const getMaxPlayers = useCallback(() => {
        return Math.min(Math.floor((deckSize - 10) / handSize), 8);
    }, [handSize, deckSize]);


    return (
        <Provider>
            <CenteredView style={styles.container}>

                <Text style={styles.titlePrimary} variant="displaySmall">
                    Maximale Spieler:
                    <Text
                        style={[styles.titlePrimary, {color: custom.colors.purple}]}> {getMaxPlayers()} </Text>
                </Text>
                <Divider style={[styles.divider, {backgroundColor: theme.colors.primaryContainer}]}/>


                <Text style={styles.title}>Handkarten</Text>
                <View style={styles.counterContainer}>
                    <TouchableOpacity
                        style={[styles.incrementerButton, {backgroundColor: isHandSizeDecrementDisabled ? 'gray' : theme.colors.primary}]}
                        onPress={() => decrementHandSize()}>
                        <Text
                            style={[styles.buttonText, {color: theme.colors.onPrimary}]}
                        >-</Text>
                    </TouchableOpacity>
                    <Text
                        style={[styles.counter, {color: theme.colors.onBackground}]}>{handSize}</Text>
                    <TouchableOpacity
                        style={[styles.incrementerButton, {backgroundColor: isHandSizeIncrementDisabled ? 'gray' : theme.colors.primary}]}
                        onPress={() => incrementHandSize()}>
                        <Text
                            style={[styles.buttonText, {color: theme.colors.onPrimary}]}
                        >+</Text>
                    </TouchableOpacity>
                </View>
                <Divider style={[styles.divider, {backgroundColor: theme.colors.primaryContainer}]}/>

                <Text style={styles.title}>Deckgröße</Text>
                <View style={styles.counterContainer}>
                    <TouchableOpacity
                        style={[styles.incrementerButton, {backgroundColor: isDeckSizeDecrementDisabled ? 'gray' : theme.colors.primary}]}
                        onPress={() => decrementDeckSize()}>
                        <Text
                            style={[styles.buttonText, {color: theme.colors.onPrimary}]}
                        >-</Text>
                    </TouchableOpacity>
                    <Text
                        style={[styles.counter, {color: theme.colors.onBackground}]}>{deckSize}</Text>
                    <TouchableOpacity
                        style={[styles.incrementerButton, {backgroundColor: isDeckSizeIncrementDisabled ? 'gray' : theme.colors.primary}]}
                        onPress={() => incrementDeckSize()}>
                        <Text
                            style={[styles.buttonText, {color: theme.colors.onPrimary}]}
                        >+</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.counter}>{deckName}</Text>


                <Divider style={[styles.divider, {backgroundColor: theme.colors.primaryContainer}]}/>


                <Button
                    onPress={createGame}
                    textColor={theme.colors.onPrimary}
                    // @ts-ignore
                    buttonColor={theme.colors.lobbyReady}
                    disabled={loading}
                    loading={loading}
                    style={styles.buttonBig}
                >
                    Raum erstellen
                </Button>
            </CenteredView>
        </Provider>
    );
};

export default newMauGame;
