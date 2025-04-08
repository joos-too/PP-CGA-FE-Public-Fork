import {Animated, BackHandler, View} from 'react-native';
import {useLocalSearchParams, useNavigation, useRouter} from 'expo-router';
import {Avatar, Button, Dialog, Divider, Icon, IconButton, Modal, Portal, Provider, Text, useTheme} from 'react-native-paper';
import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {gameLobbyStyles, styles} from '@/constants/Styles';
import {custom} from '@/constants/Colors';
import Clipboard from '@react-native-clipboard/clipboard';
import LobbyPlayerComponent from '@/components/LobbyPlayerComponent';
import RuleTooltip from '@/components/LobbyRuleComponent';
import {CenteredView} from '@/components/ThemedComponents';
import QRCode from 'react-native-qrcode-svg';
import Toast from 'react-native-toast-message';
import Share from 'react-native-share';
import {api_url, ws_url} from '@/constants/Network';
import {useSession} from '@/hooks/authContext';
import {fetchAvatar, fetchData} from '@/utilities/requests';
import {GameResponse, PlayerStatus} from '@/constants/Interfaces';
import ScrollView = Animated.ScrollView;

export default function GameLobby() {
    const theme = useTheme();
    const navigation = useNavigation();
    const gameLobbyParameters: GameResponse = JSON.parse(useLocalSearchParams().gameParameters as string);
    const [ws, setws] = useState<WebSocket | null>(null);
    const {sessionToken, id} = useSession();
    const router = useRouter();
    const [visible, setVisible] = useState(false);
    const [action, setAction] = useState<(() => void) | null>(null);
    const [ready, setReady] = useState(false);
    const [minPlayerIssue, setMinPlayerHint] = useState(false);
    const [copied, setCopied] = useState(false);
    const [leavingGame, setLeaveGame] = useState(false);
    const [openTooltipIndex, setOpenTooltipIndex] = useState(null);
    const [qrCodeModalVisible, setQRCodeModalVisible] = useState(false);
    const qrCodeLogo = require('../../assets/images/icon.png');


    const toggleModal = () => {
        setQRCodeModalVisible(!qrCodeModalVisible);
    };

    const gameNameMapping: { [key: string]: string } = {
        'maumau': 'Mau Mau',
        'lügen': 'Lügen',
    };

    const gameMinUserMapping: { [key: string]: number } = {
        'maumau': 2,
        'lügen': 3,
    };

    const gamePageMapping: { [key: string]: string } = {
        'maumau': 'MauGameView',
        'lügen': 'LuegenGameView',
    };

    const deckNameMapping: { [key: number]: string } = {
        32: 'Skat-Deck',
        52: 'Rommé-Deck',
        64: 'Doppeltes Skat-Deck',
        104: 'Doppeltes Rommé-Deck',
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

    const shareCode = () => {
        const shareOptions = {
            message: `Spiel mit mir eine Runde ${gameNameMapping[gameLobbyParameters.type]} in PP-CGA! Code: ${api_url}/instajoin?code=${gameLobbyParameters.code}`,
        };
        Share.open(shareOptions).catch((err) => console.log(err));
    };

    type PlayerNameStorage = {
        [key: string]: string;
    };

    type PlayerImgStorage = {
        [key: string]: string;
    };

    const nameStorage: PlayerNameStorage = {};
    const imgStorage: PlayerImgStorage = {};


    //dynamic value: current players
    const [playerList, setPlayerList] = useState<Map<string, PlayerStatus>>(new Map());


    const handleOpen = (index: number) => {
        // @ts-ignore
        setOpenTooltipIndex(index);

    };

    const handleClose = () => {
        setOpenTooltipIndex(null);
    };


    const toggleReadyButton = () => {
        setReady(!ready);
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: gameNameMapping[gameLobbyParameters.type],
            headerLeft: () => (
                <IconButton
                    icon="logout"
                    size={40}
                    onPressIn={() => showDialog(leaveGame)}
                    style={[styles.headerLeft, styles.rotatedIcon]}
                    // @ts-ignore
                    iconColor={theme.colors.lobbyLeave}
                />
            ),
        });
    }, [navigation]);

    useEffect(() => {
        if (ws != null && ws.readyState == 1) {
            ws.send('{"action" : "ready", "ready": ' + ready + '}');
        }
    }, [ready]);

    const showDialog = useCallback((action: () => void) => {
        setVisible(true);
        setAction(() => action);
    }, []);

    const hideDialog = useCallback(() => {
        setVisible(false);
        setAction(null);
    }, []);

    const leaveGame = useCallback(() => {
        setLeaveGame(true);
    }, [router]);

    useEffect(() => {
        if (ws != null && ws.readyState == 1) {
            ws.send('{"action" : "leave_lobby"}');
        }
    }, [leavingGame]);


    const getReadyPlayers = () => {
        let readyPlayers = 0;
        playerList.forEach((playerStatus) => {
            if (playerStatus.playerStatus) {
                readyPlayers++;
            }
        });
        return readyPlayers;
    };
    useEffect(() => {
        const backAction = () => {
            showDialog(leaveGame);
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove();
    }, [showDialog, leaveGame]);

    const copyCodeClipboard = () => {
        Clipboard.setString(String(lobbyParameters.lobbyCode));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };


    const getUserByID = async (userID: string) => {
        try {
            const response = await fetchData(sessionToken, '/user/' + userID);

            const userData = await response.json();
            return userData.username;


        } catch (error) {
            console.log('User request err ' + error);
        }

    };
    const connectToWebsocket = () => {
        const wsRequest = ws_url + `/game/ws/${gameLobbyParameters.id}?token=${sessionToken}`;
        const webSocket = new WebSocket(wsRequest);
        webSocket.onopen = () => {
            webSocket.send('{"action" : "request_lobby_data"}');
        };

        webSocket.onerror = (error) => {
            console.log('WebSocket-Fehler: ', error);
        };

        webSocket.onmessage = async (event) => {
            const messageJSON = JSON.parse(event.data);


            if (messageJSON['action'] === 'ready') {
                const updatedPlayers = messageJSON['players'];

                setPlayerList((prevList) => {
                    const newList = new Map(prevList);

                    Object.entries(updatedPlayers).forEach(([playerId, status]) => {
                        const playerStatus = newList.get(playerId);
                        if (playerStatus) {
                            playerStatus.playerStatus = status as boolean;
                            newList.set(playerId, playerStatus);
                        }
                    });

                    return newList;
                });
            }

            if (messageJSON['action'] === 'lobby_data') {
                const players = Object.entries(messageJSON['players']);
                const newPlayerList = new Map<string, PlayerStatus>();

                for (const [playerId, status] of players) {
                    let resolvedPlayerImg = imgStorage[playerId];
                    if (!resolvedPlayerImg) {
                        resolvedPlayerImg = await fetchAvatar(playerId, sessionToken) as string;
                        if (resolvedPlayerImg) {
                            imgStorage[playerId] = resolvedPlayerImg;
                        }
                    }

                    let resolvedPlayerName = nameStorage[playerId];
                    if (!resolvedPlayerName) {
                        resolvedPlayerName = await getUserByID(playerId);
                        nameStorage[playerId] = resolvedPlayerName;
                    }

                    newPlayerList.set(playerId, {
                        playerName: resolvedPlayerName,
                        playerStatus: status as boolean,
                        playerImg: resolvedPlayerImg,
                    });
                }

                setPlayerList(newPlayerList);
            }

            if (messageJSON['action'] === 'join') {

                const playerId = messageJSON['player'];

                const playerName = await getUserByID(playerId);
                nameStorage[playerId] = playerName;
                const playerImg = await fetchAvatar(playerId, sessionToken);
                if (playerImg != null) {
                    imgStorage[playerId] = playerImg;
                }

                setPlayerList((prevList) => {
                    const newList = new Map(prevList);
                    newList.set(playerId, {
                        playerName: playerName,
                        playerStatus: false,
                        playerImg: playerImg as string,
                    });
                    return newList;
                });
                Toast.show({
                    type: 'playerActionToast',
                    props: {playerName, imageURI: playerImg, isJoin: true},
                });

                webSocket.send('{"action" : "request_lobby_data"}');
            }

            if (messageJSON['action'] === 'leave_lobby') {

                const leftPlayerId = messageJSON['player'];
                if (leftPlayerId !== id) {
                    const playerName = nameStorage[leftPlayerId];
                    const playerImg = imgStorage[leftPlayerId];
                    Toast.show({
                        type: 'playerActionToast',
                        props: {playerName: playerName, imageURI: playerImg, isJoin: false},
                    });
                }

                setPlayerList((prevList) => {
                    const newList = new Map(prevList);
                    newList.delete(leftPlayerId);
                    return newList;
                });

                if (messageJSON['player'] === id) {
                    webSocket.close();
                    router.replace('/');
                }
            }

            if (messageJSON['action'] === 'start') {
                webSocket.close();
                router.replace({
                        //@ts-ignore
                        pathname: `/${gamePageMapping[gameLobbyParameters.type]}`,
                        params: {
                            roomid: gameLobbyParameters.id,
                            roomcode: gameLobbyParameters.code,
                            gamemode: gameLobbyParameters.gamemode,
                            deck_size: gameLobbyParameters.deck_size,
                            nameCache: JSON.stringify(nameStorage),
                            imgCache: JSON.stringify(imgStorage),
                        },
                    },
                );
            }
        };
        setws(webSocket);
    };


    if (ws == null || ws.readyState == 3) {
        ws?.close();
        connectToWebsocket();
    }

    useEffect(() => {
        if (ws == null || ws.readyState == 3) {
            console.log(ws);
            ws?.close();
            connectToWebsocket();
        }
    }, [ws]);

    //lobby parameters - get from backend ONCE. current players are dynamic and controlled by useState

    const lobbyParameters = {
        lobbyName: 'Testlobby',
        lobbyCode: gameLobbyParameters.code,
        lobbyMaxUsers: gameLobbyParameters.max_players,
        gameMinUsers: gameMinUserMapping[gameLobbyParameters.type],
        ruleModifications: [
            {
                name: gameLobbyParameters.type === 'lügen'
                    ? gameLobbyParameters.gamemode === 'gamemode_classic'
                        ? 'Asse müssen gelogen werden, 4 Asse führen zum Ausscheiden'
                        : 'Asse werden wie normale Karten behandelt'
                    : `Größe der Starthand: ${gameLobbyParameters.number_of_start_cards} Karten`,
                imgName: gameLobbyParameters.type === 'lügen'
                    ? 'alpha-a-box'
                    : 'numeric-' + gameLobbyParameters.number_of_start_cards + '-box',
            },
            {
                name: `${deckNameMapping[gameLobbyParameters.deck_size]} (${gameLobbyParameters.deck_size} Karten)`,
                imgName: 'alpha-k-box',
            },
        ],
    };


    useEffect(() => {
        console.log('rp:' + getReadyPlayers());
        if (playerList.size < lobbyParameters.gameMinUsers) {
            setMinPlayerHint(true);
        } else {
            setMinPlayerHint(false);
        }
    }, [playerList]);


    return (
        <Provider>
            <CenteredView style={gameLobbyStyles.container}>


                <View style={[gameLobbyStyles.gameCodeBackground,
                    //@ts-ignore
                    {backgroundColor: theme.colors.gameCodeBackground, borderColor: theme.colors.primary}]}>
                    <View style={gameLobbyStyles.rowContainer}>
                        <Text style={gameLobbyStyles.titleSecondary}>Raum-ID:</Text>
                    </View>
                    <View style={gameLobbyStyles.rowContainer}>


                        <Button labelStyle={gameLobbyStyles.gameCodeText}
                                contentStyle={{flexDirection: 'row-reverse'}}
                                textColor={custom.colors.lightPurple}
                            //@ts-ignore
                                style={[gameLobbyStyles.gameCodeButton, {backgroundColor: theme.colors.gameCodeButton}]}
                                icon={copied ? 'check' : 'content-copy'}
                                onPress={() => {
                                    copyCodeClipboard();
                                }}>
                            {(lobbyParameters.lobbyCode as unknown as number)}
                        </Button>
                        <IconButton
                            //@ts-ignore
                            style={[gameLobbyStyles.gameCodeButton, {backgroundColor: theme.colors.gameCodeButton}]}
                            icon={'qrcode'} onPress={toggleModal}
                            iconColor={custom.colors.lightPurple}>
                        </IconButton>

                        <IconButton
                            //@ts-ignore
                            style={[gameLobbyStyles.gameCodeButton, {backgroundColor: theme.colors.gameCodeButton}]}
                            icon={'share-variant'} onPress={shareCode} iconColor={custom.colors.lightPurple}>
                        </IconButton>
                    </View>
                </View>


                <Button
                    mode="contained"
                    onPress={toggleReadyButton}
                    style={[
                        gameLobbyStyles.readyButton,
                        //@ts-ignore
                        {backgroundColor: ready ? theme.colors.lobbyReady : theme.colors.lobbyUnready}]}>
                    {(ready ? 'Bereit' : 'Nicht bereit') + ' ' + getReadyPlayers() + '/' + (minPlayerIssue ? lobbyParameters.gameMinUsers : playerList.size)}
                </Button>
                <Text style={gameLobbyStyles.infoText}>
                    Das Spiel startet automatisch, wenn die Mindestanzahl an Spielern ({lobbyParameters.gameMinUsers})
                    erreicht ist und alle Spieler bereit sind
                </Text>
                <Text style={gameLobbyStyles.titleSecondary}>
                    Spieler in der Lobby:
                    <Text style={{color: custom.colors.purple}}>
                        {` ${playerList.size}/${lobbyParameters.lobbyMaxUsers}`}
                    </Text>
                </Text>
                <ScrollView style={gameLobbyStyles.playerScrollList}>
                    {Array.from(playerList.entries()).map(([playerId, item], _) => (
                        <View key={playerId} style={gameLobbyStyles.rowContainer}>
                            {item.playerImg ? (
                                <Avatar.Image
                                    //@ts-ignore
                                    source={{
                                        uri: item.playerImg,
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': sessionToken,
                                        },
                                    }}
                                    size={36}
                                    style={gameLobbyStyles.imgStyle}
                                />
                            ) : (
                                <Avatar.Text
                                    label={item.playerName ? item.playerName.charAt(0).toUpperCase() : ' - '}
                                    size={36}
                                    style={[gameLobbyStyles.imgStyle, {backgroundColor: theme.colors.primary}]}
                                />
                            )}
                            <CenteredView>
                                <LobbyPlayerComponent PlayerName={item.playerName} PlayerReady={item.playerStatus}/>
                            </CenteredView>
                        </View>
                    ))}
                    {Array.from({length: lobbyParameters.lobbyMaxUsers - playerList.size}).map((_, index) => (
                        <View key={index} style={gameLobbyStyles.rowContainer}>
                            <CenteredView>
                                <LobbyPlayerComponent
                                    PlayerName={''}
                                    PlayerReady={false}
                                />
                            </CenteredView>
                        </View>
                    ))}

                </ScrollView>
                {minPlayerIssue ?
                    <Text style={gameLobbyStyles.titleSecondary}>
                        Noch {lobbyParameters.gameMinUsers - playerList.size} Spieler erforderlich!
                    </Text> : <Text> </Text>}


                <Divider style={gameLobbyStyles.divider}/>

                <Text style={gameLobbyStyles.titleSecondary}>Spielparameter:</Text>
                <View style={gameLobbyStyles.rowContainer}>
                    {lobbyParameters.ruleModifications.map((rule, index) => (
                        <RuleTooltip
                            key={index}
                            rule={rule}
                            isOpen={openTooltipIndex === index}
                            onOpen={() => handleOpen(index)}
                            onClose={handleClose}
                        />
                    ))}
                </View>
                <Modal
                    visible={qrCodeModalVisible}
                    onDismiss={() => {
                        setQRCodeModalVisible(false);
                    }}
                    contentContainerStyle={[gameLobbyStyles.modalContainer, {backgroundColor: theme.colors.background}]}
                >

                    <View style={gameLobbyStyles.rowContainer}>
                        <Icon size={24} source={'alert-circle-outline'}/>
                        <Text>Der QR-Code bringt angemeldete Nutzer direkt in diese Lobby.</Text>
                    </View>


                    <QRCode
                        value={`${api_url}/instajoin?code=${gameLobbyParameters.code}`}
                        size={225}
                        logo={qrCodeLogo}
                        logoMargin={-1}
                        quietZone={10}
                        logoSize={45}
                        logoBorderRadius={10}
                        enableLinearGradient={true}
                        // @ts-ignore
                        linearGradient={[custom.colors.qrCodeTop, custom.colors.qrCodeBottom]}
                        logoBackgroundColor="transparent"
                    />
                    <Button
                        mode="contained"
                        onPress={toggleModal}
                        style={gameLobbyStyles.qrCodeClose}
                    >
                        Schließen
                    </Button>
                </Modal>

                <Portal>
                    <Dialog visible={visible} onDismiss={hideDialog}>
                        <Dialog.Title>Bestätigung</Dialog.Title>
                        <Dialog.Content>
                            <Text>Willst du wirklich den Raum verlassen?</Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={hideDialog}>Nein</Button>
                            <Button onPress={() => {
                                hideDialog();
                                action?.();
                            }}>Ja</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </CenteredView>
            <Toast config={toastConfig}/>
        </Provider>

    );
};

