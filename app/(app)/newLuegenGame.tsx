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
import RulesetWidget from '@/components/RulesetWidget';

const newLuegenGame = () => {
    const theme = useTheme();
    const {sessionToken} = useSession();
    const [loading, setLoading] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(1);

    // Constants for deck sizes
    const DECK_SIZES = [32, 52, 64, 104];
    const DECK_NAMES = ['Skat', 'Rommé', 'Doppel Skat', 'Doppel Rommé'];

    // States for deck size
    const [deckName, setDeckName] = useState<string>(DECK_NAMES[1]);
    const [deckSize, setDeckSize] = useState<number>(DECK_SIZES[1]);
    const isDeckSizeIncrementDisabled = DECK_SIZES.indexOf(deckSize) === DECK_SIZES.length - 1;
    const isDeckSizeDecrementDisabled = DECK_SIZES.indexOf(deckSize) === 0;

    const rulesetOptions = [
        {
            id: 1,
            imageUrl: require('../../assets/images/icon.png'),
            label: 'Klassisch',


        },
        {
            id: 2,
            imageUrl: require('../../assets/images/icon-crossed.png'),
            label: 'Alternativ',
        },

    ];

    const handleOptionSelect = (optionId: number) => {
        setSelectedOption(optionId);

    };

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
                type: 'lügen', //YAAAAY Umlaute in api requests!🙂
                number_of_start_cards: 5,
                deck_size: deckSize,
                gamemode: selectedOption === 1 ? 'gamemode_classic' : 'gamemode_alternative',
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
        return Math.min(Math.floor(deckSize / 6), 8);
    }, [deckSize]);


    return (
        <Provider>
            <CenteredView style={styles.container}>

                <Text style={styles.titlePrimary} variant="displaySmall">
                    Maximale Spieler:
                    <Text
                        style={[styles.titlePrimary, {color: custom.colors.purple}]}> {getMaxPlayers()} </Text>
                </Text>

                <RulesetWidget options={rulesetOptions} scale={1} onSelect={handleOptionSelect}></RulesetWidget>
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
                    disabled={loading}
                    loading={loading}
                    // @ts-ignore
                    buttonColor={theme.colors.lobbyReady}
                    style={styles.buttonBig}
                >
                    Raum erstellen
                </Button>
            </CenteredView>
        </Provider>
    );
};

export default newLuegenGame;
