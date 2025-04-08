import React, {useEffect, useRef, useState} from 'react';
import {BackHandler, TouchableOpacity, Vibration as SatisfyerProTwo, View} from 'react-native';
import {ActivityIndicator, Avatar, Button, Dialog, IconButton, Portal, Snackbar, Text, useTheme} from 'react-native-paper';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useLocalSearchParams, useRouter} from 'expo-router';

import {cardStyles, gameLobbyStyles, gameStyles, mauOwnHandStyles, rankingStyles, styles, timeoutPenaltyStyles} from '@/constants/Styles';
import {reverseTranslateCard, sortHandSuitFirst, translateCard, translateDeck} from '@/utilities/deckUtils';
import {custom} from '@/constants/Colors';
import {CardBack, CardFront, CardType} from '@/components/Card';
import Player from '@/components/Player';
import OwnHand from '@/components/OwnHand';
import {useSession} from '@/hooks/authContext';
import JackSelectionComponent from '@/components/JackSelectionComponent';
import TurnTimer from '@/components/TurnTimer';
import Leaderboard from '@/components/Leaderboard';
import {fetchAvatar, fetchData} from '@/utilities/requests';
import {GameResponse, MauGameData} from '@/constants/Interfaces';
import {ws_url} from '@/constants/Network';
import Toast from 'react-native-toast-message';

export default function MauGameView() {
    const theme = useTheme();
    const router = useRouter();
    const {sessionToken, id} = useSession();
    const {roomid, roomcode, nameCache, imgCache} = useLocalSearchParams();

    const initNameCache = nameCache ? JSON.parse(nameCache as string) : {};
    const initImgCache = imgCache ? JSON.parse(imgCache as string) : {};
    const ws = useRef<WebSocket | null>(null);

    // Static variables
    const jackOptions = [
        {
            id: 'Hearts',
            label: 'Herz',
            imageUrl: require('../../assets/images/SuitHearts.png'),
        },
        {
            id: 'Diamonds',
            label: 'Karo',
            imageUrl: require('../../assets/images/SuitDiamonds.png'),
        },
        {
            id: 'Clubs',
            label: 'Kreuz',
            imageUrl: require('../../assets/images/SuitClubs.png'),
        }, {
            id: 'Spades',
            label: 'Pik',
            imageUrl: require('../../assets/images/SuitSpades.png'),
        },
    ];
    const valueTranslations = {'Hearts': 'Herz', 'Diamonds': 'Karo', 'Clubs': 'Kreuz', 'Spades': 'Pik'};
    const playerPositionsOnTable: { [key: string]: { x: number; y: number } } = {
        'left-bottom': {x: -150, y: 170},
        'left-middle': {x: -150, y: -10},
        'left-top': {x: -150, y: -200},
        'top': {x: 0, y: -268},
        'right-top': {x: 150, y: -200},
        'right-middle': {x: 150, y: -10},
        'right-bottom': {x: 150, y: 170},
    };
    const errorMappingMauMau: { [key: string]: string } = {
        card_not_allowed: 'Diese Karte passt nicht!',
        not_your_turn: 'Du bist nicht am Zug!',
        has_to_draw_penalty: 'Du musst zuvor Karten ziehen!',
        cant_draw_again: 'Du hast diese Runde bereits gezogen!',
    };

    // Refs for state management
    const playerListRef = useRef<{ id: string; position: string; cardCount: number }[]>([]);
    const countSevenRef = useRef(0);
    const penaltyCardCountRef = useRef(0);
    const hasToDrawPenaltyRef = useRef(false);
    const finishedPlayersRef = useRef<{ id: string, rank: number, leftEarly: boolean }[]>([]);

    //Game state
    const gameData = useRef<MauGameData | null>(null);

    // Player states
    const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);
    const [playerList, setPlayerList] = useState<{ id: string; position: string; cardCount: number }[]>([]);
    const [playerNames, setPlayerNames] = useState<{ [key: string]: string }>({});
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    // Card states
    const [hand, setHand] = useState<CardType[]>([]);
    const [discardPile, setDiscardPile] = useState<CardType[]>([]);
    const [drawPile, setDrawPile] = useState<CardType[]>([]);
    const [currentDrawnCard, setCurrentDrawnCard] = useState<CardType | null>(null);
    const [currentDroppedCard, setCurrentDroppedCard] = useState<CardType | null>(null);
    const [droppingCardIndex, setDroppingCardIndex] = useState<number | null>(null);

    // Mau mechanics
    const [mauButtonPressed, setMauButtonPressed] = useState(false);
    const [mauAnnouncer, setMauAnnouncer] = useState<string | null>(null);
    const [mauMessageVisible, setMauMessageVisible] = useState(false);

    // Special card states
    const [hasDrawn, setHasDrawn] = useState(false);
    const [countSeven, setCountSeven] = useState(0);
    const [canCounterSeven, setCanCounterSeven] = useState(false);
    const [hasToDrawPenalty, setHasToDrawPenalty] = useState(false);
    const [drawPenaltyDone, setDrawPenaltyDone] = useState(false);

    const [jChoice, setJChoice] = useState<string | null>(null);
    const [jackSelectionVisible, setJackSelectionVisible] = useState(false);

    // Others
    const [isCurrentPlayerDrawing, setIsCurrentPlayerDrawing] = useState(false);
    const [isOtherPlayerDropping, setIsOtherPlayerDropping] = useState(false);
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
        countSevenRef.current = countSeven;
    }, [countSeven]);
    useEffect(() => {
        hasToDrawPenaltyRef.current = hasToDrawPenalty;
    }, [hasToDrawPenalty]);
    useEffect(() => {
        if (showLeaderboard) {
            console.log('🏆 Leaderboard geöffnet mit Spielern:', finishedPlayersRef.current);
        }
    }, [showLeaderboard]);

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
    const updateHasToDrawPenalty = (newState: boolean | ((prevState: boolean) => boolean)) => {
        if (typeof newState === 'boolean') {
            hasToDrawPenaltyRef.current = newState;
        }
        setHasToDrawPenalty(newState);
    };

    const initializeGame = (gameData: MauGameData) => {
        setCurrentPlayer(gameData.current_player);

        if (gameData.current_player === id) {
            console.log('🕒 Starting initial turn timer for first player');
            startTurnTimer();
            setIsTimerVisible(true);
        }

        console.log('🃏 Setze erste Karte auf den Ablagestapel:', gameData.discard_pile);
        setDiscardPile([translateCard(gameData.discard_pile)]);

        console.log('🎲 Setze initialen `draw_pile` mit', gameData.draw_pile, 'Karten');
        const dummyDeck = Array(gameData.draw_pile).fill({suit: '?', value: '?'});
        setDrawPile(dummyDeck);

        const translatedHand = sortHandSuitFirst(translateDeck(gameData.hand));
        console.log('🖐️ Meine Start-Hand:', translatedHand);
        setHand(translatedHand);

        // Player initialization
        const handCount = gameData.players;
        const playerIds = Object.keys(handCount);
        const playerPositionsOnTable = ['left-bottom', 'left-middle', 'left-top', 'top', 'right-top', 'right-middle', 'right-bottom'];

        // Find the current player's index
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
    };

    // Use Effects
    useEffect(() => {
        if (turnTimer === 0) {
            handleTimeoutPenalty();
        }
    }, [turnTimer]);
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
        playerList.forEach(async (player) => {
            if (!playerNames[player.id]) {
                const name = await getUserByID(player.id);
                setPlayerNames((prev) => ({...prev, [player.id]: name}));
            }
        });
    }, [playerList]); // Get Player names for positions
    useEffect(() => {
        if (discardPile.length === 0) return;

        setTimeout(() => {
            const topCard = discardPile[discardPile.length - 1];

            if (topCard?.value === '7' && currentPlayer === id && countSevenRef.current > 0 && !drawPenaltyDone) {

                const hasSeven = hand.some(card => card.value === '7');

                setCanCounterSeven(hasSeven);
                updateHasToDrawPenalty(!hasSeven);
            }
        }, 300);

    }, [discardPile.length, countSeven, currentPlayer, drawPenaltyDone]); // Draw penalty cards
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
                    initializeGame(data);
                    break;
                case 'place_card_on_stack':
                    setHasDrawn(false);
                    const placedCard = translateCard(data.card);

                    if (placedCard.value === '7') {
                        setTimeout(() => setDrawPenaltyDone(false), 0);

                        setCountSeven(prevCount => prevCount + 1);
                    }
                    if (placedCard.value === 'J') {
                        // @ts-ignore
                        setJChoice(valueTranslations[data.j_choice] || data.j_choice);
                    } else {
                        setJChoice(null);
                    }
                    if (data.player === id) {
                        setDiscardPile((prevPile) => [...prevPile, placedCard]);
                        setMauButtonPressed(false);
                    } else {
                        DropCardOtherPlayer(data.player, placedCard);
                    }
                    break;
                case 'turn':
                    setCurrentPlayer(data.player);
                    if (data.player === id) {
                        startTurnTimer();
                        setIsTimerVisible(true);
                    } else {
                        setIsTimerVisible(false);
                        if (timerIntervalRef.current) {
                            clearInterval(timerIntervalRef.current);
                        }
                        setTurnTimer(60);
                    }
                    break;
                case 'card_count':
                    setPlayerList((prevList) => {
                        return prevList.map((player) => {
                            const newCardCount = data.hand_count[player.id] || 0;
                            const prevCardCount = player.cardCount;

                            if (data.draw_pile_count !== undefined || data.draw_pile_count !== 0) {

                                setDrawPile((prevPile) => {
                                    const newPileSize = data.draw_pile_count;
                                    if (newPileSize === prevPile.length) return prevPile;

                                    return Array(newPileSize).fill({suit: '?', value: '?'});
                                });
                            }
                            if (player.id === id) {
                                return {
                                    ...player,
                                    cardCount: newCardCount,
                                };
                            }
                            if (newCardCount > prevCardCount) {
                                animateDrawnCardForPlayer(player.id, 1, () => {

                                    setPlayerList((updatedList) =>
                                        updatedList.map((p) =>
                                            p.id === player.id ? {...p, cardCount: newCardCount} : p,
                                        ),
                                    );
                                });
                                return {...player};
                            }
                            return {
                                ...player,
                                cardCount: newCardCount,
                            };
                        });
                    });
                    break;
                case 'hand':

                    const newHand = translateDeck(data.hand);
                    const new_cards = Array.isArray(data.cards) ? translateDeck(data.cards) : translateDeck([data.cards]);

                    if (hasToDrawPenaltyRef.current) {


                        animateMultipleDraws(new_cards, () => {
                            setHasToDrawPenalty(false);
                            setCountSeven(0);
                            penaltyCardCountRef.current = 0;
                        });

                    } else {
                        console.log(new_cards);
                        if (new_cards) {
                            setCurrentDrawnCard(new_cards[0]);
                            animateDrawnCard(new_cards[0], () => {
                                setHand(sortHandSuitFirst(newHand));
                                setCurrentDrawnCard(null);
                            });
                        } else {
                            console.warn('⚠️ Keine neue Karte gefunden!');
                            setHand(sortHandSuitFirst(newHand));
                        }
                    }

                    setHasToDrawPenalty(false);
                    setCountSeven(0);
                    break;
                case 'draw_card':
                    // No frontend action needed
                    break;
                case 'draw_penalty':
                    if (data.player === id) {
                        penaltyCardCountRef.current = data.count_7;
                    } else {
                        animateDrawnCardForPlayer(data.player, data.count_7, () => {
                        });
                    }
                    setHasToDrawPenalty(false);
                    setCountSeven(0);
                    setDrawPenaltyDone(true);
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
                    console.log(`🏁 Spiel beendet! Zeige Leaderboard.`);
                    // Clear Timer
                    setIsTimerVisible(false);
                    if (timerIntervalRef.current) {
                        clearInterval(timerIntervalRef.current);
                    }

                    // Filter out players who left early
                    let finishedPlayersFiltered = finishedPlayersRef.current.filter(player => !player.leftEarly);
                    const handCountMap = gameData.current?.players || {};
                    const allPlayerIds = Object.keys(handCountMap);
                    const finishedPlayerIds = finishedPlayersRef.current.map(p => p.id);
                    const remainingPlayers = allPlayerIds.filter(id => !finishedPlayerIds.includes(id));

                    console.log('🏁 Alle Spieler:', allPlayerIds);
                    console.log('🏁 Bereits beendet:', finishedPlayerIds);
                    console.log('🏁 Fehlende Spieler:', remainingPlayers);

                    remainingPlayers.forEach((playerId) => {
                        if (!finishedPlayersFiltered.some(p => p.id === playerId)) {
                            finishedPlayersFiltered.push({
                                id: playerId,
                                rank: finishedPlayersFiltered.length + 1,
                                leftEarly: false,
                            });
                        }
                    });

                    console.log('🏁 Finales Ranking:', finishedPlayersFiltered);
                    finishedPlayersRef.current = finishedPlayersFiltered;

                    setTimeout(() => setShowLeaderboard(true), 3000);
                    break;
                case 'mau':
                    console.log(`📢 Spieler ${data.player} hat Mau gesagt!`);
                    const playerName = await getUserByID(data.player);
                    console.log(`📢 Spieler ${playerName} hat Mau gesagt!`);
                    setMauAnnouncer(playerName);
                    setMauMessageVisible(true);

                    setTimeout(() => {
                        setMauMessageVisible(false);
                        setMauAnnouncer(null);
                    }, 3000);
                    break;
                case 'leave_game':
                    const leftPlayerId = data.player;
                    if (leftPlayerId !== id) {
                        const playerName = await getUserByID(data.player);
                        if (initNameCache[leftPlayerId]) {
                            Toast.show({
                                type: 'playerActionToast',
                                props: {playerName: playerName, imageURI: initImgCache[leftPlayerId], isJoin: false},
                            });
                        } else {
                            const playerImg = await fetchAvatar(leftPlayerId, sessionToken);
                            Toast.show({
                                type: 'playerActionToast',
                                props: {playerName: playerName, imageURI: playerImg, isJoin: false},
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

                if (['no_choice_provided', 'card_not_in_hand', 'card_not_allowed', 'j_choice_not_possible', 'not_your_turn', 'has_to_draw_penalty'].includes(data.error)) {

                    setDiscardPile((prevPile) => {
                        if (prevPile.length === 0) return prevPile;

                        const lastDroppedCard = prevPile[prevPile.length - 1];
                        setHand((prevHand) => sortHandSuitFirst([...prevHand, translateCard(lastDroppedCard)]));
                        return prevPile.slice(0, -1);
                    });
                }

                const errorMapped = errorMappingMauMau[data.error];
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

    }, []); // Websocket connection

    // Game actions
    // Drop card
    const handleDrop = (index: number) => {
        const card = hand[index];
        const cardTranslated = reverseTranslateCard(card);

        if (cardTranslated.value === 'J') {
            setJackSelectionVisible(true);
            setDroppingCardIndex(index);
            return;
        }

        dropCardToServer(cardTranslated, index, 'none');
    };
    const onJackSelection = (selectedSuit: string) => {
        if (droppingCardIndex === null) {
            return;
        }

        const jackCard = {...reverseTranslateCard(hand[droppingCardIndex])};
        dropCardToServer(jackCard, droppingCardIndex, selectedSuit);
        setDroppingCardIndex(null);
    };
    const dropCardToServer = (card: { suit: string; value: string }, index: number, jSelection: string) => {
        ws.current?.send(
            JSON.stringify({
                action: 'place_card_on_stack',
                card: card,
                mau: mauButtonPressed,
                j_choice: jSelection,
            }),
        );

        setDiscardPile((prevPile) => [...prevPile, translateCard(card)]);
        setHand(prevHand => prevHand.filter(c => c.id !== hand[index].id));
    };


    // Draw card
    const handleDraw = async () => {
        if (drawPile.length === 0) {
            console.log('🚨 Ziehstapel ist leer! Warten auf Backend-Update.');
            return;
        }
        if (currentPlayer !== id) {
            console.log(`⛔ Du bist nicht am Zug! (Zug von: ${currentPlayer})`);
            return;
        }
        if (hasToDrawPenalty || countSevenRef.current > 0) {
            console.log(`⛔ Du musst noch ${countSevenRef.current} Strafkarten ziehen!`);
            return;
        }

        setIsCurrentPlayerDrawing(true);
        setHasDrawn(true);

        ws.current?.send(
            JSON.stringify({
                action: 'draw_card',
            }),
        );
    };
    const handleDrawPenalty = () => {
        ws.current?.send(
            JSON.stringify({action: 'draw_penalty'}),
        );
        setTimeout(() => {
            updateHasToDrawPenalty(false);
            setCountSeven(0);
        }, 200);
    };

    // Animations and UI-Effects
    const animateDrawnCard = (drawnCard: CardType, onComplete: () => void) => {
        setIsCurrentPlayerDrawing(true);
        setCurrentDrawnCard(drawnCard);

        cardWidth.value = cardStyles.card.width;
        cardHeight.value = cardStyles.card.height;

        translateX.value = -40;
        translateY.value = 30;
        opacity.value = 0;

        opacity.value = withTiming(1, {duration: 300});

        setTimeout(() => {
            translateY.value = withTiming(300, {duration: 300});

            setTimeout(() => {
                setCurrentDrawnCard(null);
                setIsCurrentPlayerDrawing(false);
                if (onComplete) onComplete();
            }, 400);
        }, 1000);
    };
    const animateMultipleDraws = (cards: CardType[], onComplete: () => void, index = 0) => {
        if (index >= cards.length) {
            onComplete();
            return;
        }
        const currentCard = cards[index];

        setIsCurrentPlayerDrawing(true);
        setCurrentDrawnCard(currentCard);

        cardWidth.value = cardStyles.card.width;
        cardHeight.value = cardStyles.card.height;

        translateX.value = -40;
        translateY.value = 30;
        opacity.value = 0;

        opacity.value = withTiming(1, {duration: 200});

        setTimeout(() => {
            translateY.value = withTiming(300, {duration: 300});

            setTimeout(() => {
                setHand((prevHand) => sortHandSuitFirst([...prevHand, currentCard]));

                setTimeout(() => {
                    setCurrentDrawnCard(null);
                    setIsCurrentPlayerDrawing(false);
                    animateMultipleDraws(cards, onComplete, index + 1);
                }, 300);
            }, 200);
        }, 800);
    };
    const animateDrawnCardForPlayer = (playerId: string, count = 1, onComplete: () => void, index = 0) => {
        if (index >= count) {
            onComplete();
            return;
        }

        setIsCurrentPlayerDrawing(false);
        setCurrentDrawnCard({id: '', suit: '?', value: '?'});

        cardWidth.value = cardStyles.cardBack.width;
        cardHeight.value = cardStyles.cardBack.height;

        // @ts-ignore
        const playerData = playerListRef.current.find((player) => player.id === playerId);
        if (!playerData) {
            console.warn('⚠️ Spieler nicht gefunden, kann Karte nicht animieren.');
            return;
        }
        const targetPosition = playerPositionsOnTable[playerData.position] || {x: 0, y: 0};

        translateX.value = 0;
        translateY.value = 50;
        opacity.value = 0;

        opacity.value = withTiming(1, {duration: 200});
        translateX.value = withTiming(targetPosition.x, {duration: 700, easing: Easing.inOut(Easing.ease)});
        translateY.value = withTiming(targetPosition.y, {duration: 700, easing: Easing.inOut(Easing.ease)});

        setTimeout(() => {
            opacity.value = withTiming(0, {duration: 300});
            setCurrentDrawnCard(null);

            setTimeout(() => {
                animateDrawnCardForPlayer(playerId, count, onComplete, index + 1);
            }, 400);
        }, 800);
    };

    const DropCardOtherPlayer = (playerId: string, card: { value: string; suit: string }) => {
        setIsOtherPlayerDropping(true);
        const cardWithId = {id: '', ...card};
        setCurrentDroppedCard(cardWithId);
        console.log('📢 Spieler ' + playerId + ' legt Karte:', card);
        // @ts-ignore
        const playerData = playerListRef.current.find((player) => player.id === playerId);
        if (!playerData) {
            console.warn('⚠️ Spieler nicht in der Liste gefunden, setze Standard-Startposition.');
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

        const targetPosition = {x: 0, y: -50};
        translateX.value = withTiming(targetPosition.x, {duration: 800, easing: Easing.inOut(Easing.ease)});
        translateY.value = withTiming(targetPosition.y, {duration: 800, easing: Easing.inOut(Easing.ease)});

        setTimeout(() => {
            opacity.value = withTiming(0, {duration: 300});

            setDiscardPile((prevPile) => [...prevPile, cardWithId]);

            setIsOtherPlayerDropping(false);
            setCurrentDroppedCard(null);
        }, 800);
    };

    // Others
    const handleSkipTurn = () => {
        ws.current?.send(
            JSON.stringify({
                action: 'skip',
            }),
        );
        setHasDrawn(false);
        updateHasToDrawPenalty(false);
        setCountSeven(0);
    };
    const handleMauButtonPress = () => {
        if (hand.length === 2 && currentPlayer === id) {
            console.log('🚨 Mau-Button pressed!');
            setMauButtonPressed(true);
        } else {
            console.log('❌ Mau nicht möglich!');
            setMauButtonPressed(false);
        }
    };

    // Navigation
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
            <View style={[{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
            }, {backgroundColor: theme.colors.background}]}>
                <View style={[gameStyles.turnContainer, {backgroundColor: theme.colors.background}]}>
                    <Text style={gameStyles.turnText}>
                        {currentPlayer === id ? 'Du bist dran! ' : ''}
                    </Text>
                </View>
                {isTimerVisible && (
                    <TurnTimer turnTimer={turnTimer}/>
                )}
            </View>
            <View style={[gameStyles.generalView, {backgroundColor: theme.colors.background}]}>
                <View style={gameStyles.table}>
                    <View>
                        {playerList.map((player) => (
                            <View key={player.id}>
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
                            </View>
                        ))}
                    </View>

                    {/*Table center*/}
                    <View style={{justifyContent: 'center', alignItems: 'center'}}>
                        <View style={cardStyles.freeCardSpace}>
                            {discardPile.length > 0 && (
                                <CardFront
                                    suit={discardPile[discardPile.length - 1].suit}
                                    value={discardPile[discardPile.length - 1].value}
                                />
                            )}
                        </View>
                        <View style={cardStyles.freeCardSpace}>
                            {drawPile.length > 0 && (
                                <CardBack onPress={handleDraw} style={{width: 60, height: 90}}/>
                            )}
                        </View>
                        {jChoice && (
                            <View style={[gameStyles.jChoiceTextContainer]}>
                                <Text style={gameStyles.messageText}>
                                    {`Bube: ${jChoice}`}
                                </Text>
                            </View>
                        )}
                        {mauMessageVisible && mauAnnouncer && (
                            <View style={gameStyles.mauTextContainer}>
                                <Text style={gameStyles.messageText}>
                                    {mauAnnouncer.length > 6 ? `${mauAnnouncer} sagt MAU!` : `${mauAnnouncer} sagt MAU!`}
                                </Text>
                            </View>
                        )}
                    </View>
                    {/* Shared Animation */}
                    {(currentDrawnCard || currentDroppedCard) && (
                        <Animated.View style={[{position: 'absolute'},
                            {
                                backgroundColor: theme.colors.background,
                                // @ts-ignore
                                borderColor: theme.colors.gameCodeButton,
                            },
                            currentDrawnCard && isCurrentPlayerDrawing
                                ? cardStyles.animatedCard // If I draw a card
                                : currentDrawnCard && !isCurrentPlayerDrawing
                                    ? cardStyles.animatedCardBack // If other player draws a card
                                    : currentDroppedCard && isOtherPlayerDropping
                                        ? cardStyles.cardFront // If other player drops a card
                                        : null, // Default
                            animatedStyle,
                        ]}>
                            {(currentDrawnCard && isCurrentPlayerDrawing) ? ( // I draw a card
                                <>
                                    <Text
                                        style={[cardStyles.topLeftValue, {color: theme.colors.onBackground}]}>{currentDrawnCard.value}</Text>
                                    <Text style={cardStyles.topLeftSuit}>{currentDrawnCard.suit}</Text>
                                    <Text style={cardStyles.center}>{currentDrawnCard.suit}</Text>
                                    <Text style={cardStyles.bottomRightSuit}>{currentDrawnCard.suit}</Text>
                                    <Text
                                        style={[cardStyles.bottomRightValue, {color: theme.colors.onBackground}]}>{currentDrawnCard.value}</Text>
                                </>
                            ) : (currentDrawnCard && !isCurrentPlayerDrawing) ? ( // Other player draws a card
                                <CardBack/>
                            ) : (currentDroppedCard && isOtherPlayerDropping) ? ( // Other player drops a card
                                <>
                                    <Text
                                        style={[cardStyles.topLeftValueCardFront, {color: theme.colors.onBackground}]}>{currentDroppedCard.value}</Text>
                                    <Text style={cardStyles.topLeftSuitCardFront}>{currentDroppedCard.suit}</Text>
                                    <Text style={cardStyles.centerCardFront}>{currentDroppedCard.suit}</Text>
                                    <Text style={cardStyles.bottomRightSuitCardFront}>{currentDroppedCard.suit}</Text>
                                    <Text
                                        style={[cardStyles.bottomRightValueCardFront, {color: theme.colors.onBackground}]}>{currentDroppedCard.value}</Text>
                                </>
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
                            onDrop={handleDrop}
                            disabled={currentPlayer !== id || hasToDrawPenalty}
                        />
                    )}
                </View>
                {(hasDrawn || (drawPile.length === 0 && currentPlayer === id)) && (
                    <TouchableOpacity
                        style={[gameStyles.actionButton, {backgroundColor: custom.colors.gameRed}]}
                        onPress={handleSkipTurn}
                    >
                        <Text style={gameStyles.mauButtonText}>Kann nicht</Text>
                    </TouchableOpacity>
                )}
                {hasToDrawPenalty && !canCounterSeven && currentPlayer === id && countSevenRef.current > 0 && !drawPenaltyDone && (
                    <TouchableOpacity
                        style={[gameStyles.actionButton, {backgroundColor: custom.colors.gameRed}]}
                        onPress={handleDrawPenalty}
                    >
                        <Text style={gameStyles.mauButtonText}>{countSevenRef.current * 2} Ziehen</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[gameStyles.mauButton, {backgroundColor: custom.colors.gameGreen}]}
                    onPress={() => handleMauButtonPress()}
                >
                    <Text style={gameStyles.mauButtonText}>Mau</Text>
                </TouchableOpacity>

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
                        <Button onPress={() => {
                            hideDialog();
                            confirmAction?.();
                        }}>
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
            <Portal>
                <Dialog visible={jackSelectionVisible} dismissable={false}>
                    <Dialog.Title style={{textAlign: 'center'}}>Farbe wählen</Dialog.Title>
                    <Dialog.Content style={{maxHeight: 400, alignItems: 'center', justifyContent: 'center'}}>
                        <JackSelectionComponent
                            options={jackOptions}
                            scale={1}
                            onSelection={(selectedSuit) => {
                                setJackSelectionVisible(false);
                                onJackSelection(selectedSuit);
                            }}
                        />
                    </Dialog.Content>
                </Dialog>
            </Portal>
        </GestureHandlerRootView>
    );
}
