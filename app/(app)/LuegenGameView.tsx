import React, {useEffect, useRef, useState} from 'react';
import {BackHandler, FlatList, TouchableOpacity, Vibration as SatisfyerProTwo, View} from 'react-native';
import {ActivityIndicator, Avatar, Button, Dialog, IconButton, Portal, Snackbar, Text, useTheme} from 'react-native-paper';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';

import {cardStyles, gameLobbyStyles, gameStyles, mauOwnHandStyles, mauPlayerHandStyles, rankingStyles, styles, timeoutPenaltyStyles} from '@/constants/Styles';
import OwnHand from '@/components/OwnHand';
import {GestureHandlerRootView, TapGestureHandler} from 'react-native-gesture-handler';
import {CardBack, CardFront, CardSmall, CardType} from '@/components/Card';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {useSession} from '@/hooks/authContext';
import Player from '@/components/Player';
import {reverseTranslateCard, sortHandValueFirst, translateCard, translateDeck} from '@/utilities/deckUtils';
import {ws_url} from '@/constants/Network';
import Toast from 'react-native-toast-message';
import {fetchAvatar, fetchData} from '@/utilities/requests';
import {GameResponse, LuegenGameData} from '@/constants/Interfaces';
import Leaderboard from '@/components/Leaderboard';
import TurnTimer from '@/components/TurnTimer';
import {custom} from '@/constants/Colors';

export default function BullshitGameView() {
    const theme = useTheme();
    const router = useRouter();
    const {sessionToken, id} = useSession();
    const {roomid, nameCache, imgCache, roomcode, deck_size, gamemode} = useLocalSearchParams();
    const initNameCache = nameCache ? JSON.parse(nameCache as string) : {};
    const initImgCache = imgCache ? JSON.parse(imgCache as string) : {};
    const ws = useRef<WebSocket | null>(null);

    // Static variables
    const playerPositionsOnTable: { [key: string]: { x: number; y: number } } = {
        'left-bottom': {x: -150, y: 170},
        'left-middle': {x: -150, y: -10},
        'left-top': {x: -150, y: -200},
        'top': {x: 0, y: -268},
        'right-top': {x: 150, y: -200},
        'right-middle': {x: 150, y: -10},
        'right-bottom': {x: 150, y: 170},
        'bottom': {x: 0, y: 300},
    };
    const valuesSkatDeck = ['7', '8', '9', '10', 'J', 'Q', 'K'];
    const valuesSkatDeckWithAce = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const valuesRommeDeck = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const valuesRommeDeckWithAce = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];


    const maxCards = deck_size === '32' || deck_size === '52' ? 3 : 7;

    const errorMappingLuegen: { [key: string]: string } = {
        not_your_turn: 'Du bist nicht am Zug!',
        too_many_cards: `Du kannst maximal ${maxCards} Karten legen!`,
    };

    // Game state
    const gameData = useRef<LuegenGameData | null>(null);

    // Card states
    const [hand, setHand] = useState<CardType[]>([]);
    const [selectedCards, setSelectedCards] = useState<number[]>([]);

    // Laid Card Pile
    const [laidCards, setLaidCards] = useState<{ suit: string; value: string }[]>([]);
    const [absoluteNumberOfLaidCards, setAbsoluteNumberOfLaidCards] = useState(0);
    const [cardsFaceDown, setCardsFaceDown] = useState(true);

    // Animation card states
    const [currentDrawnCards, setCurrentDrawnCards] = useState<CardType[] | null>(null);
    const [currentDroppedCards, setCurrentDroppedCards] = useState<CardType[] | null>(null);

    // Discard pile
    const [discardPile, setDiscardPile] = useState<CardType[]>([]);
    const [groupedDiscardPiles, setGroupedDiscardPiles] = useState<{ value: string; cards: CardType[] }[]>([]);
    const [discardPileModalVisible, setDiscardPileModalVisible] = useState(false);

    // Player states
    const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);
    const [playerList, setPlayerList] = useState<{ id: string; position: string; cardCount: number }[]>([]);
    const [playerNames, setPlayerNames] = useState<{ [key: string]: string }>({});
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    // Value selection Modal
    const [cardValueSelectionModalVisible, setCardValueSelectionModalVisible] = useState(false);

    // Challenge and claimed value mechanics
    const [challengerMessageVisible, setChallengerMessageVisible] = useState(false);
    const [challenger, setChallenger] = useState<string | null>(null);
    const [lieMessage, setLieMessage] = useState<string | null>(null);
    const [showClaimedValue, setShowClaimedValue] = useState(false);
    const [claimerName, setClaimerName] = useState<string | null>(null);
    const [lossMessageVisible, setLossMessageVisible] = useState(false);
    const [lossMessage, setLossMessage] = useState<string | null>(null);
    const isChallengeActive = useRef(false);

    // Refs for state management
    const playerListRef = useRef<{ id: string; position: string; cardCount: number }[]>([]);
    const cardsToLay = useRef<CardType[]>([]);
    const claimedValue = useRef<string | null>(null);
    const n_last = useRef<number | null>(null);
    const playersWithDiscardAnimation = useRef<string[]>([]);
    const isClaimerOneself = useRef(false);
    const finishedPlayersRef = useRef<{ id: string, rank: number, leftEarly: boolean }[]>([]);

    // Others
    const [showCardsFaceUp, setShowCardsFaceUp] = useState(false);
    const [error, setError] = useState('');
    const [dialogVisible, setDialogVisible] = useState(false);
    const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
    const [turnTimer, setTurnTimer] = useState(60);
    const [isTimerVisible, setIsTimerVisible] = useState(false);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [dialogTimeoutPenalty, setDialogTimeoutPenalty] = useState(false);


    const startTurnTimer = () => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }

        setTurnTimer(60);

        timerIntervalRef.current = setInterval(() => {
            setTurnTimer((prevTimer) => {
                if (prevTimer <= 1) {
                    if (timerIntervalRef.current) {
                        clearInterval(timerIntervalRef.current);
                    }
                    return 0;
                }
                const vibrationTimers = [11, 4, 3, 2];

                if (vibrationTimers.includes(prevTimer)) {
                    SatisfyerProTwo.vibrate(500);
                }
                return prevTimer - 1;
            });
        }, 1000);
    };

    // Animation values
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0);
    const rotateY = useSharedValue(0);
    const cardWidth = useSharedValue(cardStyles.card.width);
    const cardHeight = useSharedValue(cardStyles.card.height);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            {translateX: translateX.value},
            {translateY: translateY.value},
        ],
        opacity: opacity.value,
        width: cardWidth.value,
        height: cardHeight.value,
    }));

    // Effects
    useEffect(() => {
        playerListRef.current = playerList;
    }, [playerList]);
    useEffect(() => {
        if (showLeaderboard) {
            console.log('🏆 Leaderboard geöffnet mit Spielern:', finishedPlayersRef.current);
        }
    }, [showLeaderboard]);


    const handleCardValueClick = (value: string) => {
        console.log(`Wert ${value} angeklickt`);
        claimedValue.current = value;
        isClaimerOneself.current = true;
        setCardValueSelectionModalVisible(false);
        handleDropCards();
    };

    // Helper-Functions
    const getPlayerRank = (playerId?: string | null): number | null => {
        if (!playerId) return null;
        const player = finishedPlayersRef.current.find((p) => p.id === playerId);
        return player ? player.rank : null;
    };
    const getUserByID = async (userID: string) => {
        console.log('--- FETCHING USER NAME BY ID ---');
        if (initNameCache[userID]) {
            console.log('Name source: Initial cache');
            return initNameCache[userID];
        } else {
            try {
                const response = await fetchData(sessionToken, '/user/' + userID);
                const userData = await response.json();
                console.log('Name source: Request');
                return userData.username;
            } catch (error) {
                console.log('User request error:', error);
                return userID;
            }
        }
    };

    function getCardRowMargin(index: number) {
        if (index === 0) return 0;
        return -40;
    }


    // Gruppierung des Ablagestapels nach Kartenwert
    useEffect(() => {
        const grouped = discardPile.reduce((acc, card) => {
            if (!acc[card.value]) {
                acc[card.value] = [];
            }
            acc[card.value].push(card);
            return acc;
        }, {} as { [key: string]: CardType[] });

        const groupedArray = Object.keys(grouped).map((key) => ({
            value: key,
            cards: grouped[key],
        }));

        setGroupedDiscardPiles(groupedArray);
    }, [discardPile]);

    // Handle card selection
    const toggleSelectCard = (index: number) => {
        setSelectedCards((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
        );
    };

    const toastConfig = {
        // @ts-ignore
        playerActionToast: ({props}) => (
            <View style={[gameLobbyStyles.toastContainer, {
                backgroundColor: theme.colors.background,
                // @ts-ignore
                borderColor: props.isJoin ? theme.colors.lobbyReady : theme.colors.lobbyLeave,
                width: '95%',
            }]}>
                <View
                    // @ts-ignore
                    style={[gameLobbyStyles.leftBorder, {backgroundColor: props.isJoin ? theme.colors.lobbyReady : theme.colors.lobbyLeave}]}/>
                {props.imageURI != null ? (
                    <Avatar.Image size={40} source={{uri: props.imageURI}} style={gameLobbyStyles.avatar}/>) : (
                    <Avatar.Text
                        label={props.playerName ? props.playerName.charAt(0).toUpperCase() : ' - '}
                        size={36}
                        style={[gameLobbyStyles.imgStyle, {backgroundColor: theme.colors.primary}]}
                    />
                )
                }
                <Text
                    style={[gameLobbyStyles.toastText, {color: theme.colors.onBackground}]}>{props.playerName} {props.isJoin ? '\nist dem Spiel beigetreten!' : '\nhat das Spiel verlassen.'}</Text>
            </View>
        ),
    };

    const showDialog = (action: () => void) => {
        setDialogVisible(true);
        setConfirmAction(() => action);
    };

    const hideDialog = () => {
        setDialogVisible(false);
        setConfirmAction(null);
    };

    const handleBackButtonPress = () => {
        showDialog(handleLeaveGame);
        return true;
    };

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            handleBackButtonPress,
        );

        return () => {
            backHandler.remove();
        };
    }, []); // Handle back button press
    useEffect(() => {
        if (turnTimer === 0) {
            handleTimeoutPenalty();
        }
    }, [turnTimer]); // Handle timeout penalty
    useEffect(() => {
        playerList.forEach(async (player) => {
            if (!playerNames[player.id]) {
                const name = await getUserByID(player.id);
                setPlayerNames((prev) => ({...prev, [player.id]: name}));
            }
        });
    }, [playerList]); // Get Player names for positions

    async function initializeGame(gameData: LuegenGameData) {

        // Current player initialization
        setCurrentPlayer(gameData.current_player);
        if (gameData.current_player === id) {
            console.log('🕒 Starting initial turn timer for first player');
            startTurnTimer();
            setIsTimerVisible(true);
        }

        // Hand initialization
        const translatedHand = sortHandValueFirst(translateDeck(gameData.hand));
        console.log('🖐️ Meine Start-Hand:', translatedHand);
        setHand(translatedHand);

        // Discard pile initialization
        let discarded_cards: CardType[] = [];
        for (let value of gameData.removed_pile) {
            let cards = [
                {suit: '♠', value: value, id: ''},
                {suit: '♣', value: value, id: ''},
                {suit: '♦', value: value, id: ''},
                {suit: '♥', value: value, id: ''},
            ];
            if (deck_size === '64' || deck_size === '104') {
                cards = cards.concat(cards);
            }
            discarded_cards = [...discarded_cards, ...cards];
        }
        setDiscardPile(discarded_cards);

        // Player initialization
        const handCount = gameData.players;
        const playerIds = Object.keys(handCount);
        const playerPositionsOnTable = ['left-bottom', 'left-middle', 'left-top', 'top', 'right-top', 'right-middle', 'right-bottom'];

        // @ts-ignore
        const ownIndex = playerIds.indexOf(id);
        if (ownIndex === -1) return;

        const reorderedPlayers = [];
        for (let i = 0; i < playerIds.length; i++) {
            if (i === ownIndex) continue;

            const relativePosition = (i - ownIndex + playerIds.length) % playerIds.length - 1;

            reorderedPlayers.push({
                id: playerIds[i],
                position: playerPositionsOnTable[relativePosition] || 'top',
                cardCount: handCount[playerIds[i]] || 0,
            });
        }

        console.log('🎮 Players positioned in gameplay order:', reorderedPlayers);
        setPlayerList(reorderedPlayers);


        // Laid Cards and Round Value initialization
        setAbsoluteNumberOfLaidCards(gameData.discard_pile_count); // discard_pile is backend name for laid cards
        if (gameData.n_last && gameData.round_value) {
            n_last.current = gameData.n_last;
            const laidCards: CardType[] = Array(gameData.n_last).fill({suit: '?', value: '?'});
            setLaidCards(laidCards);

            claimedValue.current = gameData.round_value;
            const lastPlayerName = await getUserByID(gameData.last_player);
            setClaimerName(lastPlayerName);
            setShowClaimedValue(true);
        }
    }

    // Websocket connection
    useEffect(() => {
        ws.current = new WebSocket(ws_url + `/game/ws/${roomid}?token=${sessionToken}`);
        ws.current.onopen = () => {
            console.log('WebSocket connected');
            ws.current?.send('{"action" : "request_game_data"}');
        };
        ws.current.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            console.log('**** Received:', data, '****');
            switch (data.action) {
                case 'game_data':
                    console.log('🎮 Spiel gestartet mit Parametern:', data);
                    gameData.current = data;
                    await initializeGame(data);
                    break;
                case 'place_cards':
                    console.log('🃏 Spieler, data.player, hat', data.n_last, 'Karte(n) abgelegt mit angesagtem Wert', data.claimed_value);
                    setCardsFaceDown(true);
                    // Cache claimed value
                    if (!claimedValue.current) {
                        claimedValue.current = data.claimed_value;
                    }
                    if (data.player !== id) {
                        isClaimerOneself.current = false;
                        const cards: CardType[] = Array(data.n_last).fill({suit: '?', value: '?'});
                        dropCardsAnimated(data.player, cards);
                    } else {
                        setLaidCards(cardsToLay.current);
                        opacity.value = withTiming(1, {duration: 300});
                        rotateY.value = 0;
                        setCardsFaceDown(true);
                    }

                    // Set number of last played cards
                    n_last.current = data.n_last;
                    setAbsoluteNumberOfLaidCards((prevState) => {
                        return prevState + data.n_last;
                    });

                    const playerName = await getUserByID(data.player);
                    setClaimerName(playerName);
                    setShowClaimedValue(true);
                    break;
                case 'challenge':
                    isChallengeActive.current = true;
                    const lastPlacedCards = data.cards.map((card: CardType) => translateCard(card));
                    console.log('🔍 Spieler', data.challenger, 'deckt Karten', lastPlacedCards, 'von Spieler', data.opponent, 'auf');

                    // Dont show claimed value message anymore
                    setShowClaimedValue(false);
                    setClaimerName(null);
                    // Set challenger and show lie message
                    const challengerName = await getUserByID(data.challenger);
                    const opponentName = await getUserByID(data.opponent);
                    setChallenger(challengerName);
                    setChallengerMessageVisible(true);

                    setLaidCards(lastPlacedCards);
                    rotateY.value = withTiming(cardsFaceDown ? 180 : 0, {duration: 500});
                    setCardsFaceDown(false);

                    // Reset claimed value
                    claimedValue.current = null;

                    setTimeout(() => {
                        setChallenger(null);
                        setChallengerMessageVisible(false);

                        if (data.success) {
                            console.log('❌ Lüge! Spieler', data.opponent, 'muss aufnehmen');
                            setLieMessage('Lüge! ' + opponentName + '\n muss aufnehmen');
                        } else {
                            console.log('✅ Wahrheit! Spieler', data.challenger, 'muss aufnehmen');
                            setLieMessage('Wahrheit! ' + challengerName + '\n muss aufnehmen');
                        }
                    }, 2000);
                    setTimeout(() => {
                        setLaidCards([]);
                        setAbsoluteNumberOfLaidCards(0);
                        setLieMessage(null);
                        isChallengeActive.current = false;

                        const playerWhoGetsCards: string = data.success ? data.opponent : data.challenger;
                        takeCardsAnimated(playerWhoGetsCards, lastPlacedCards);
                    }, 4500);
                    break;
                case 'hand':
                    const newHand = sortHandValueFirst(translateDeck(data.hand));
                    console.log('🖐️ Neue Hand erhalten:', newHand);
                    setTimeout(() => {
                        setHand(newHand);
                    }, isChallengeActive.current ? 5300 : 0);
                    break;
                case 'discard_duplicates':
                    console.log(`🚮 Spieler ${data.player} hat Duplikate abgelegt:`, data.value);
                    setHand((prevHand) => prevHand.filter(
                        (card) => reverseTranslateCard(card).value !== data.value));

                    let cards = [
                        {suit: '♠', value: data.value, id: ''},
                        {suit: '♣', value: data.value, id: ''},
                        {suit: '♦', value: data.value, id: ''},
                        {suit: '♥', value: data.value, id: ''},
                    ];
                    if (deck_size === '64' || deck_size === '104') {
                        cards = cards.concat(cards);
                    }

                    setTimeout(() => {
                        dropCardOnDiscardPileAnimated(data.player, cards);
                    }, 6000);
                    break;
                case 'turn':
                    setTimeout(() => {
                        setCurrentPlayer(data.player);
                        if (data.player === id) {
                            setIsTimerVisible(true);
                            startTurnTimer();
                        } else {
                            setIsTimerVisible(false);
                            if (timerIntervalRef.current) {
                                clearInterval(timerIntervalRef.current);
                            }
                            setTurnTimer(60);
                        }
                    }, isChallengeActive.current ? 5300 : 0);
                    break;
                case 'card_count':
                    // timeout after challenge
                    setTimeout(() => {
                        setPlayerList((prevList) => {
                            return prevList.map((player) => {
                                const newCardCount = data.hand_count[player.id] || 0;
                                return {
                                    ...player,
                                    cardCount: newCardCount,
                                };
                            });
                        });
                    }, isChallengeActive.current ? 5300 : 0);

                    break;
                case 'win':
                    console.log(`🎉 Spieler ${data.player} hat gewonnen!`);
                    if (finishedPlayersRef.current.some(p => p.id === data.player)) return;
                    const amountOfFinishedPlayers = finishedPlayersRef.current.filter(player => !player.leftEarly).length;
                    finishedPlayersRef.current.push({
                        id: data.player,
                        rank: amountOfFinishedPlayers + 1,
                        leftEarly: false,
                    });
                    break;
                case 'end':
                    setTimeout(async () => {
                        console.log(`🏁 Spiel beendet! Grund: ${data.reason}`);
                        // Clear Timer
                        setIsTimerVisible(false);
                        if (timerIntervalRef.current) {
                            clearInterval(timerIntervalRef.current);
                        }

                        let loserName: string = '';
                        if (data.player) {
                            loserName = await getUserByID(data.player);
                        }

                        // Filter out players who left early
                        console.log('🏆 Fertige Spieler vor Filterung:', finishedPlayersRef.current);
                        let finishedPlayersFiltered = finishedPlayersRef.current.filter(player => !player.leftEarly);
                        console.log('Fertige Spieler nach Filterung:', finishedPlayersFiltered);
                        const handCountMap = gameData.current?.players || {};
                        const allPlayerIds = Object.keys(handCountMap);
                        const finishedPlayerIds = finishedPlayersRef.current.map(p => p.id);
                        const remainingPlayers = allPlayerIds.filter(id => !finishedPlayerIds.includes(id));

                        // Don't show claimed value and challenge messages anymore
                        setShowClaimedValue(false);
                        setClaimerName(null);
                        setChallenger(null);
                        setChallengerMessageVisible(false);

                        if (data.reason === 'Pair of Aces') {
                            console.log(`🔴 Spieler ${data.player} hatte alle vier Asse und verliert automatisch.`);
                            setLossMessage(`Spieler ${loserName} hatte alle Asse und verliert.`);
                            setLossMessageVisible(true);

                            // Alle fertigen Spieler werden 1.
                            finishedPlayersFiltered = finishedPlayersFiltered.map(player => ({
                                id: player.id,
                                rank: 1,
                                leftEarly: false,
                            }));

                            // Alle anderen verbleibenden Spieler sind auch 1.
                            remainingPlayers.forEach((playerId) => {
                                if (playerId !== data.player) {
                                    finishedPlayersFiltered.push({id: playerId, rank: 1, leftEarly: false});
                                }
                            });

                            console.log('Fertige Spieler:', finishedPlayersFiltered.length);
                            console.log('Übrige Spieler:', remainingPlayers.length);
                            // Spieler mit 4 Assen kommt auf den letzten Platz
                            finishedPlayersFiltered.push({
                                id: data.player,
                                rank: finishedPlayersFiltered.length + 1,
                                leftEarly: false,
                            });


                        } else if (data.reason === 'only_two_players_left') {
                            console.log(`⚠️ Nur noch zwei Spieler übrig. Spiel wird beendet.`);
                            setLossMessage(`Nur noch zwei Spieler übrig. Spiel ist zuende.`);
                            setLossMessageVisible(true);

                            // Die zwei letzten Spieler auf die letzten beiden Plätze setzen
                            const amountOfFinishedPlayers = finishedPlayersFiltered.length;
                            remainingPlayers.forEach((playerId) => {
                                finishedPlayersFiltered.push({
                                    id: playerId,
                                    rank: amountOfFinishedPlayers + 1,
                                    leftEarly: false,
                                });
                            });

                        }
                        // Sortiere die Liste nach `rank`, damit das Leaderboard es richtig anzeigt
                        finishedPlayersFiltered.sort((a, b) => a.rank - b.rank);

                        console.log('🏆 Aktualisierte Rangliste:', finishedPlayersFiltered);
                        finishedPlayersRef.current = finishedPlayersFiltered;


                        setTimeout(() => setShowLeaderboard(true), 3000);
                    }, isChallengeActive.current ? 7500 : 3000);
                    break;
                case 'leave_game':
                    const leftPlayerId = data.player;
                    if (leftPlayerId !== id) {
                        const playerName = await getUserByID(data.player);

                        if (initNameCache[leftPlayerId]) {
                            Toast.show({
                                type: 'playerActionToast',
                                props: {playerName: playerName, imageURI: initImgCache[leftPlayerId], isJoin: false},
                                position: 'top', // oder 'bottom' falls nötig
                                bottomOffset: 100, // Abstand nach oben oder unten
                            });
                        } else {
                            const playerImg = await fetchAvatar(leftPlayerId, sessionToken);
                            console.log('🚪 Spieler', playerName, 'hat das Spiel verlassen.');
                            Toast.show({
                                type: 'playerActionToast',
                                props: {playerName: playerName, imageURI: playerImg, isJoin: false},
                                position: 'top', // oder 'bottom' falls nötig
                                bottomOffset: 100, // Abstand nach oben oder unten
                            });
                        }

                        if (!finishedPlayersRef.current.some(p => p.id === leftPlayerId)) {
                            finishedPlayersRef.current.push({
                                id: data.player,
                                rank: 0,
                                leftEarly: true,
                            });
                        }
                    } else {
                        ws.current?.close();
                        router.replace('/');
                    }
                    break;
                default:
                    console.warn('Unknown action:', data.action);
            }

            if (data.error) {
                console.log('❌ Backend rejected the move:', data.error);

                if (data.error === 'game_not_started') {
                    ws.current?.close();
                    router.replace('/');
                }

                if (['card_not_in_hand', 'too_many_cards', 'not_your_turn'].includes(data.error)) {
                    console.log('🔄 Restoring last dropped cards to hand...');
                    setHand((prevHand) => sortHandValueFirst([...prevHand, ...cardsToLay.current]));
                    if (isClaimerOneself.current) {
                        console.log('... and resetting claimed Value');
                        claimedValue.current = null;
                    }
                }

                const errorMapped = errorMappingLuegen[data.error];
                if (errorMapped) {
                    setError(errorMapped);
                } else {
                    setError(data.error);
                }
            }
        };
        ws.current.onclose = (event) => {
            console.log('WebSocket-Verbindung geschlossen');
            console.log('Close Code: ', event.code);
            console.log('Close Reason: ', event.reason);
        };

    }, []);

    // Handle dropping selected cards
    const handleDropCards = () => {
        if (selectedCards.length === 0) return;

        // Open selection modal if there is no current claimed value (first round)
        if (!claimedValue.current) {
            setCardValueSelectionModalVisible(true);
        } else {
            handlePlaceCards();
        }
    };

    const handlePlaceCards = () => {
        const cards = selectedCards.map((index) => hand[index]);
        cardsToLay.current = cards;
        const cardsTranslated = cards.map((card) => reverseTranslateCard(card));

        console.log('🃏 Karten ablegen: ', cardsTranslated);
        const payload = JSON.stringify({
            action: 'place_cards',
            cards: cardsTranslated,
            claimed_value: claimedValue.current,
        });
        ws.current?.send(payload);

        setHand((prevHand) => prevHand.filter((_, i) => !selectedCards.includes(i)));
        setSelectedCards([]);
    };

    // Flip cards on tap and challenge
    const handleFlipCards = () => {
        if (laidCards.length === 0) {
            return;
        }
        if (currentPlayer !== id) {
            console.log(`⛔ Du bist nicht am Zug! (Zug von: ${currentPlayer})`);
            setError(errorMappingLuegen['not_your_turn']);
            return;
        }

        if (cardsFaceDown) {
            // Clear all selected cards
            setSelectedCards([]);
            ws.current?.send('{"action":"challenge"}');
        }
    };

    const takeCardsAnimated = (playerId: string, cards: CardType[]) => {
        setShowCardsFaceUp(true);
        setCurrentDrawnCards(cards);
        // @ts-ignore
        let playerData = playerListRef.current.find((player) => player.id === playerId);

        if (playerId === id) {
            // Create mock player data
            playerData = {'position': 'bottom', id: id, cardCount: 0};
        }

        if (!playerData) {
            console.warn('⚠️ Spieler nicht in der Liste gefunden!');
            return;
        }
        const assignedPosition = playerPositionsOnTable[playerData.position];
        if (!assignedPosition) {
            console.warn(`⚠️ Keine Position für Spieler ${playerId} gefunden!`);
            return;
        }

        cardWidth.value = 60;
        cardHeight.value = 90;
        const targetPosition = {x: 0, y: 0};
        translateX.value = targetPosition.x;
        translateY.value = targetPosition.y;
        opacity.value = 1;

        translateX.value = withTiming(assignedPosition.x, {duration: 800, easing: Easing.inOut(Easing.ease)});
        translateY.value = withTiming(assignedPosition.y, {duration: 800, easing: Easing.inOut(Easing.ease)});

        setTimeout(() => {
            opacity.value = withTiming(0, {duration: 300});
            setLieMessage(null);
            setCurrentDrawnCards(null);
        }, 800);
    };

    const dropCardsAnimated = (playerId: string, cards: CardType[]) => {
        setShowCardsFaceUp(false);
        setCurrentDroppedCards(cards);
        // @ts-ignore
        let playerData = playerListRef.current.find((player) => player.id === playerId);

        if (!playerData) {
            console.warn('⚠️ Spieler nicht in der Liste gefunden!');
            return;
        }
        const assignedPosition = playerPositionsOnTable[playerData.position];
        if (!assignedPosition) {
            console.warn(`⚠️ Keine Position für Spieler ${playerId} gefunden!`);
            return;
        }

        cardWidth.value = 60;
        cardHeight.value = 90;
        translateX.value = assignedPosition.x;
        translateY.value = assignedPosition.y;
        opacity.value = 1;

        const targetPosition = {x: 0, y: -6};
        translateX.value = withTiming(targetPosition.x, {duration: 800, easing: Easing.inOut(Easing.ease)});
        translateY.value = withTiming(targetPosition.y, {duration: 800, easing: Easing.inOut(Easing.ease)});

        setTimeout(() => {
            opacity.value = withTiming(0, {duration: 300});
            setLaidCards(cards);
            setCurrentDroppedCards(null);
        }, 800);
    };

    const dropCardOnDiscardPileAnimated = (playerId: string, cards: CardType[]) => {
        // How long the animation takes in whole
        const animationDuration = 800;

        if (playersWithDiscardAnimation.current.includes(playerId)) {
            console.log('🔄 Ablagestapel-Animation wird übersprungen, da bereits eine Animation für diesen Spieler läuft.');
            setTimeout(() => {
                setDiscardPile((prevPile) => [...prevPile, ...cards]);
            }, animationDuration);
            return;
        }

        // Don't show double discards for same player
        if (playerId === id) {
            playersWithDiscardAnimation.current.push(playerId);
        }
        setShowCardsFaceUp(true);
        setCurrentDroppedCards(cards);
        // @ts-ignore
        let playerData = playerListRef.current.find((player) => player.id === playerId);

        if (playerId === id) {
            // Create mock player data
            playerData = {'position': 'bottom', id: id, cardCount: 0};
        }

        if (!playerData) {
            console.warn('⚠️ Spieler nicht in der Liste gefunden!');
            return;
        }
        const assignedPosition = playerPositionsOnTable[playerData.position];
        if (!assignedPosition) {
            console.warn(`⚠️ Keine Position für Spieler ${playerId} gefunden!`);
            return;
        }

        cardWidth.value = cardStyles.cardFront.width;
        cardHeight.value = cardStyles.cardFront.height;
        translateX.value = assignedPosition.x;
        translateY.value = assignedPosition.y;
        opacity.value = 1;

        const targetPosition = {x: 0, y: 85};
        translateX.value = withTiming(targetPosition.x, {
            duration: animationDuration,
            easing: Easing.inOut(Easing.ease),
        });
        translateY.value = withTiming(targetPosition.y, {
            duration: animationDuration,
            easing: Easing.inOut(Easing.ease),
        });

        setTimeout(() => {
            opacity.value = withTiming(0, {duration: 300});
            setDiscardPile((prevPile) => [...prevPile, ...cards]);
            setCurrentDroppedCards(null);
            // Remove player from active animation list
            if (playerId === id) {
                playersWithDiscardAnimation.current = playersWithDiscardAnimation.current.filter(pID => pID !== playerId);
            }
        }, animationDuration);
    };

    const handleLeaveGame = () => {
        if (finishedPlayersRef.current.find((p) => p.id === id)) {
            ws.current?.close();
            router.replace('/');
        } else {
            ws.current?.send(JSON.stringify({action: 'leave_game'}));
        }
    };
    const handleLeaveGameAfterFinish = () => {
        ws.current?.close();
        router.replace('/');
    };
    const handleStayInLobby = async () => {
        try {
            const response = await fetchData(sessionToken, '/game/' + roomcode);
            const data: GameResponse = await response.json();

            ws.current?.send('{"action" : "join"}');
            if (ws.current != null) {
                ws.current.onmessage = (event) => {
                    const messageJSON = JSON.parse(event.data);

                    if (messageJSON['action'] == 'join') {
                        ws.current?.close();
                        router.replace({pathname: '/gameLobby', params: {gameParameters: JSON.stringify(data)}});
                    }
                    if (messageJSON['error']) {
                        ws.current?.close();
                        router.replace('/');
                        console.log('Websocket closed due to join error:', messageJSON['error']);
                    }
                };
            } else {
                router.replace('/');
            }
        } catch (error) {
            console.log('error: ' + error);
            router.replace('/');
        }
    };
    const handleTimeoutPenalty = () => {
        setDialogTimeoutPenalty(true);

        setTimeout(() => {
            ws.current?.send(JSON.stringify({action: 'leave_game'}));
        }, 3000);
    };

    return (
        <GestureHandlerRootView style={{flex: 1}}>
            {/* "X"-Button oben links */}
            {!showLeaderboard && (
                <IconButton
                    icon="logout"
                    // @ts-ignore
                    iconColor={theme.colors.lobbyLeave}
                    size={40}
                    style={[{
                        position: 'absolute',
                        top: 25,
                        left: 0,
                        zIndex: showLeaderboard ? -1 : 10,
                    }, styles.rotatedIcon]}
                    onPress={() => showDialog(handleLeaveGame)}
                />
            )}
            <View
                style={[
                    {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
                    {backgroundColor: theme.colors.background},
                ]}
            >
                <View style={[gameStyles.turnContainer, {backgroundColor: theme.colors.background}]}>
                    <Text style={gameStyles.turnText}>
                        {currentPlayer === id ? 'Du bist dran!' : ''}
                    </Text>
                </View>
                {isTimerVisible && (
                    <TurnTimer turnTimer={turnTimer}/>
                )}
            </View>
            <View style={[gameStyles.generalView, {backgroundColor: theme.colors.background}]}>
                <View style={gameStyles.table}>
                    <View style={gameStyles.playerContainer}>
                        {playerList.map((player) => (
                            <Player
                                key={player.id}
                                initialImgUri={initImgCache[player.id] ? initImgCache[player.id] : null}
                                name={playerNames[player.id]}
                                cardCount={player.cardCount}
                                //@ts-ignore
                                position={player.position}
                                playerId={player.id}
                                isTurn={currentPlayer === player.id}
                            />
                        ))}
                    </View>
                    <View style={gameStyles.messageContainerBullshit}>
                        {challengerMessageVisible && challenger && (
                            <View style={[gameStyles.bullshitTextContainer]}>
                                <Text style={gameStyles.messageText}>
                                    {`${challenger} sagt Lüge!`}
                                </Text>
                            </View>
                        )}

                        {lieMessage && (
                            <View style={[gameStyles.bullshitTextContainer]}>
                                <Text style={gameStyles.messageText}>
                                    {lieMessage}
                                </Text>
                            </View>
                        )}

                        {lossMessageVisible && lossMessage && (
                            <View style={[gameStyles.bullshitTextContainer]}>
                                <Text style={gameStyles.messageText}>
                                    {lossMessage}
                                </Text>
                            </View>
                        )}
                        {showClaimedValue && claimerName && (
                            <View style={[gameStyles.bullshitTextContainer]}>
                                <Text style={gameStyles.messageText}>
                                    {`${claimerName} \n sagt: ${n_last.current} x ${claimedValue.current}`}
                                </Text>
                            </View>
                        )}
                    </View>
                    {/* Table center */}
                    <View style={gameStyles.tableCenter}>
                        <View>
                            <Text style={styles.text}>Karten gesamt: {absoluteNumberOfLaidCards}</Text>
                        </View>
                        <TouchableOpacity onPress={handleFlipCards}>
                            <View style={cardStyles.cardRow}>
                                {laidCards.length > 0 && (
                                    cardsFaceDown ? (
                                        laidCards.map((_, index) => (
                                            <CardBack
                                                key={index}
                                                style={{
                                                    width: 60,
                                                    height: 90,
                                                    marginLeft: getCardRowMargin(index),
                                                }}
                                            />
                                        ))
                                    ) : (
                                        laidCards.map((card, index) => (
                                            <CardFront
                                                key={index}
                                                suit={card.suit}
                                                value={card.value}
                                                style={{
                                                    marginLeft: getCardRowMargin(index),
                                                }}
                                            />
                                        ))
                                    )
                                )}
                            </View>
                        </TouchableOpacity>
                        <View style={cardStyles.freeCardSpace}>
                            {discardPile.length > 0 && (
                                <TapGestureHandler onEnded={() => setDiscardPileModalVisible(true)}>
                                    <View>
                                        <CardFront
                                            suit={discardPile[discardPile.length - 1].suit}
                                            value={discardPile[discardPile.length - 1].value}
                                            style={{width: 60, height: 90}}
                                        />
                                    </View>
                                </TapGestureHandler>
                            )}
                        </View>
                    </View>
                    {/*Shared Animation*/}
                    {(currentDrawnCards || currentDroppedCards) && (
                        <Animated.View style={[{position: 'absolute'},
                            currentDrawnCards
                                ? currentDrawnCards.length > 1 ? mauPlayerHandStyles.cardRowHorizontal : null // Any Player takes cards
                                : currentDroppedCards && !showCardsFaceUp
                                    ? currentDroppedCards.length > 1 ? mauPlayerHandStyles.cardRowHorizontal : null // Other player lays cards
                                    : currentDroppedCards && showCardsFaceUp
                                        ? null // Any Player discards cards
                                        : null, // Default
                            animatedStyle,
                        ]}>
                            {currentDrawnCards ? ( // Any Player takes cards
                                currentDrawnCards.map((card, index) => (
                                    <CardFront
                                        key={index}
                                        suit={card.suit}
                                        value={card.value}
                                        style={{
                                            marginLeft: getCardRowMargin(index),
                                        }}
                                    />
                                ))
                            ) : (currentDroppedCards && !showCardsFaceUp) ? ( // Other player lays cards
                                currentDroppedCards.map((_, index) => (
                                    <CardBack
                                        key={index}
                                        style={{
                                            width: 60,
                                            height: 90,
                                            marginLeft: getCardRowMargin(index),
                                        }}
                                    />
                                ))
                            ) : (currentDroppedCards && showCardsFaceUp) ? ( // Any Player discards cards
                                <CardFront suit={currentDroppedCards[currentDroppedCards.length - 1].suit}
                                           value={currentDroppedCards[currentDroppedCards.length - 1].value}/>
                            ) : null
                            }
                        </Animated.View>
                    )}
                </View>
                {/*Own Hand Container*/}
                <View style={[mauOwnHandStyles.ownHandContainer]}>
                    {getPlayerRank(id) ? (
                        <View style={rankingStyles.placementTextContainer}>
                            <Text
                                style={[rankingStyles.placementText, {color: ['gold', 'silver', '#CD7F32', theme.colors.onBackground][Math.min(getPlayerRank(id)! - 1, 3)]}]}>
                                Du bist {getPlayerRank(id)}.
                            </Text>
                        </View>
                    ) : (
                        <OwnHand
                            hand={hand}
                            selectedCards={selectedCards}
                            setSelectedCard={toggleSelectCard}
                            needsSelection={true}
                            onDrop={handleDropCards}
                            disabled={currentPlayer !== id}
                        />
                    )}
                </View>
                <Snackbar
                    visible={!!error}
                    onDismiss={() => setError('')}
                    action={{
                        label: 'OK',
                        onPress: () => setError(''),
                    }}
                >
                    {error}
                </Snackbar>
            </View>
            <Portal>
                <Dialog visible={dialogVisible} onDismiss={hideDialog}>
                    <Dialog.Title>Bestätigung</Dialog.Title>
                    <Dialog.Content>
                        <Text>Möchtest du das Spiel wirklich verlassen?</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={hideDialog}>Nein</Button>
                        <Button
                            onPress={() => {
                                hideDialog();
                                confirmAction?.();
                            }}
                        >
                            Ja
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
            <Portal>
                <Dialog
                    visible={dialogTimeoutPenalty}
                    dismissable={false}
                    style={timeoutPenaltyStyles.dialogContainer}
                >
                    <Dialog.Icon icon="alert-circle" size={50} color={custom.colors.gameRed}/>
                    <Dialog.Title style={timeoutPenaltyStyles.title}>⏳ Zeitstrafe</Dialog.Title>
                    <Dialog.Content>
                        <View style={timeoutPenaltyStyles.contentContainer}>
                            <Text style={timeoutPenaltyStyles.messageText}>
                                Du hast nicht innerhalb des Zeitlimits gelegt.
                            </Text>
                            <Text style={timeoutPenaltyStyles.warningText}>
                                Du wirst aus dem Spiel entfernt!
                            </Text>
                        </View>
                    </Dialog.Content>
                    <Dialog.Actions style={timeoutPenaltyStyles.actionsContainer}>
                        <ActivityIndicator animating={true} size="large" color={custom.colors.gameRed}/>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            <Portal>
                <Dialog visible={discardPileModalVisible} onDismiss={() => setDiscardPileModalVisible(false)}>
                    <Dialog.Title style={{textAlign: 'center', alignSelf: 'center', width: '100%'}}>
                        Aussortierte Karten
                    </Dialog.Title>
                    <Dialog.Content style={{maxHeight: 400}}>
                        <FlatList
                            data={groupedDiscardPiles}
                            keyExtractor={(_, index) => index.toString()}
                            numColumns={4}
                            contentContainerStyle={{paddingVertical: 10}}
                            scrollEnabled={true}
                            renderItem={({item}) => (
                                <View style={{flex: 1, margin: 5, alignItems: 'center'}}>
                                    <View style={{width: 60, height: 90, position: 'relative'}}>
                                        {Array.isArray(item.cards) &&
                                            item.cards.map((card, cardIndex) => (
                                                <CardSmall
                                                    key={cardIndex}
                                                    suit={card.suit}
                                                    value={card.value}
                                                    style={{
                                                        position: 'absolute',
                                                        top: cardIndex * 2,
                                                        left: cardIndex * 2,
                                                    }}
                                                />
                                            ))}
                                    </View>
                                </View>
                            )}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setDiscardPileModalVisible(false)}>Schließen</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
            {/* Neues Modal für den "Ansagen"-Button */}
            <Portal>
                <Dialog visible={cardValueSelectionModalVisible}
                        dismissable={false}>
                    <Dialog.Title style={{textAlign: 'center'}}>Wähle einen Kartenwert!</Dialog.Title>
                    <Dialog.Content style={{maxHeight: 400}}>
                        <FlatList
                            data={deck_size === '32' || deck_size === '64'
                                ? gamemode === 'gamemode_classic' ? valuesSkatDeck : valuesSkatDeckWithAce
                                : gamemode === 'gamemode_classic' ? valuesRommeDeck : valuesRommeDeckWithAce}
                            keyExtractor={(item) => item}
                            numColumns={3}
                            contentContainerStyle={{paddingVertical: 10, alignItems: 'center'}}
                            renderItem={({item}) => (
                                <TouchableOpacity onPress={() => handleCardValueClick(item)} style={{margin: 10}}>
                                    <CardFront suit="♥" value={item}/>
                                </TouchableOpacity>
                            )}
                        />
                    </Dialog.Content>
                </Dialog>
            </Portal>
            {showLeaderboard && (
                <Leaderboard
                    players={finishedPlayersRef.current}
                    onPlayAgain={async () => {
                        console.log('Spiel wird neu gestartet.');
                        setShowLeaderboard(false);
                        await handleStayInLobby();
                    }}
                    onExit={() => {
                        console.log('Zurück zum Hauptmenü.');
                        setShowLeaderboard(false);
                        handleLeaveGameAfterFinish();
                    }}
                />
            )}
            <Portal>
                <Toast config={toastConfig}/>
            </Portal>

        </GestureHandlerRootView>
    );
}
