import {Dimensions, StyleSheet} from 'react-native';
import {custom} from '@/constants/Colors';


const windowHeight = Dimensions.get('window').height;
export const styles = StyleSheet.create({
    centered_container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        padding: 16,
    },
    logo: {
        width: 200,
        height: 200,
        marginBottom: 0,
    },
    title: {
        fontSize: 24,
        marginBottom: 10,
        fontWeight: 'bold',
        textAlignVertical: 'top',
    },
    titlePrimary: {
        marginBottom: 10,
        fontWeight: 'bold',
        textAlignVertical: 'top',
    },
    titleSecondary: {
        fontSize: 20,
        alignSelf: 'center',
    },
    input: {
        width: '100%',
        marginBottom: 10,
    },
    buttonBig: {
        width: '75%',
        paddingVertical: 8,
        marginVertical: 8,
    },
    incrementerButton: {
        padding: 7,
        borderRadius: 5,
        width: '30%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 25,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '80%',
        alignSelf: 'center',
        marginVertical: 20,
    },
    counter: {
        fontSize: 24,
        fontWeight: 'bold',
        marginHorizontal: 20,
    },
    registerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: -6,
    },
    focusedIcon: {
        marginBottom: -4,
    },
    defaultIcon: {
        marginBottom: 0,
    },
    text: {
        fontSize: 16,
        marginRight: 0,
    },
    textBold: {
        fontWeight: 'bold',
    },
    registerLine: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -10,
    },
    signInButton: {
        width: '100%',
        paddingVertical: 8,
        marginVertical: 8,
    },
    divider: {
        width: '90%',
        height: 1,
        backgroundColor: 'white',
        marginVertical: 10,
    },
    deckContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerLeft: {
        marginVertical: 0,
    },
    headerRight: {
        marginVertical: 0,
        right: '40%',
    },
    rotatedIcon: {
        transform: [{rotate: '180deg'}],
    },
    dividerView: {
        marginBottom: 50,
    },
});

export const landingpage = StyleSheet.create({
    homeView: {
        flex: 1,
        padding: 16,
    },
    innerHomeView: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    welcomeText: {
        top: 10,
        position: 'absolute',
        textAlign: 'center',
    },
    textInput: {
        width: '100%',
        maxWidth: 400,
        marginBottom: 10,
    },
    enterRoomBtn: {
        width: '95%',
        paddingVertical: 8,
        marginVertical: 8,
        marginBottom: 75,
    },
    gameBtn: {
        width: '70%',
        marginBottom: 10,
    },
    logoutBtn: {
        alignSelf: 'center',
        position: 'absolute',
        bottom: 30,
    },
    gameSelectionButtonSegment: {
        width: '95%',
        height: 58,
        marginVertical: 16,
    },
    gameSelectionButton: {
        justifyContent: 'center',
    },
    gameSelectionButtonText: {
        marginTop: 10,
        fontWeight: 'bold',
        height: 32,
    },
});

export const gameLobbyStyles = StyleSheet.create({

    imgStyle: {
        marginHorizontal: 10,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleSecondary: {
        fontSize: 20,
        alignSelf: 'center',
    },
    infoText: {
        margin: 4,
        marginTop: 25,
        textAlign: 'center',
        fontSize: 14,
    },
    gameCodeBackground: {
        borderRadius: 20,
        borderWidth: 1,
    },
    gameCodeButton: {
        display: 'flex',
        justifyContent: 'center',
        margin: 4,
        borderRadius: 20,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        alignSelf: 'center',
        width: '70%',
        height: '55%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 16,
        alignItems: 'center',
    },
    qrCodeClose: {
        width: '70%',
        marginVertical: 20,
    },
    gameCodeText: {
        fontWeight: 'bold',
    },
    readyButton: {
        width: 210,
        borderRadius: 15,
        marginTop: 12,
    },
    rowContainer: {
        flexDirection: 'row',
        padding: 4,
        verticalAlign: 'middle',
        justifyContent: 'center',
    },
    divider: {
        width: '95%',
        height: 1,
        backgroundColor: 'black',
        marginVertical: 10,
    },
    gameListDivider: {
        width: '100%',
        height: 1,
        backgroundColor: 'grey',
        marginVertical: 5,
    },
    playerScrollList: {
        width: '80%',
        maxWidth: '80%',
        maxHeight: 350,
    },
    toastContainer: {
        borderWidth: 1,
        padding: 10,
        verticalAlign: 'middle',
        justifyContent: 'center',
        height: 60,
        width: '100%',
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        borderRadius: 8,
        elevation: 3,
    },
    leftBorder: {
        width: 5,
        height: '100%',
        position: 'absolute',
        left: 0,
    },
    avatar: {
        marginRight: 10,
    },
    toastText: {
        color: '#000000',
        fontSize: 16,
    },

});

export const gameStyles = StyleSheet.create({
    generalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    table: {
        width: '70%',
        height: '80%',
        backgroundColor: '#3c6e71',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 80,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 5},
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    playerContainer: {
        zIndex: 0,
    },
    messageContainerBullshit: {
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    tableCenter: {
        top: 30,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -1,
    },
    mauButton: {
        position: 'absolute',
        bottom: 130,
        left: '50%',
        transform: [{translateX: -40}],
        borderRadius: 10,
        width: 80,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'green',
    },
    mauButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    actionButton: {
        position: 'absolute',
        bottom: 180,
        left: '48%',
        transform: [{translateX: -40}],
        borderRadius: 10,
        width: 100,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    turnContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 0,
    },
    turnText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 40,
        textAlign: 'center',
    },
    jChoiceTextContainer: {
        position: 'absolute',
        bottom: -39,
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    mauTextContainer: {
        position: 'absolute',
        top: -70,
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 100,
    },
    bullshitTextContainer: {
        position: 'absolute',
        top: -50,
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 100,
    },
    messageText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
});

export const jackSelectionStyles = StyleSheet.create({
    jackSelection: {
        borderRadius: 25,
        marginLeft: 0,
        borderWidth: 5,
        borderTopWidth: 5.1,
        borderBottomWidth: 5.1,
        padding: 10,
    },
    jackSelectionImage: {
        width: 50,
        height: 50,
        marginBottom: 0,
    },
});

export const cardStyles = StyleSheet.create({
    card: {
        width: 80,
        height: 120,
        borderRadius: 8,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
    },
    topLeftValue: {
        position: 'absolute',
        top: 3,
        left: 8,
        fontSize: 14,
    },
    topLeftSuit: {
        position: 'absolute',
        top: 22,
        left: 4,
        fontSize: 14,
    },
    center: {
        fontSize: 24,
        textAlign: 'center',
        textAlignVertical: 'center',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomRightSuit: {
        position: 'absolute',
        bottom: 20,
        right: 4,
        fontSize: 14,
        transform: [{rotate: '180deg'}],
    },
    bottomRightValue: {
        position: 'absolute',
        bottom: 2,
        right: 8,
        fontSize: 14,
        transform: [{rotate: '180deg'}],
    },
    cardFront: {
        width: 60,
        height: 90,
        borderRadius: 8,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
    },
    topLeftValueCardFront: {
        position: 'absolute',
        top: 2,
        left: 6,
        fontSize: 14,
    },
    topLeftSuitCardFront: {
        position: 'absolute',
        top: 20,
        left: 4,
        fontSize: 10,
    },
    centerCardFront: {
        fontSize: 16,
        textAlign: 'center',
        textAlignVertical: 'center',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomRightSuitCardFront: {
        position: 'absolute',
        bottom: 20,
        right: 4,
        fontSize: 10,
        transform: [{rotate: '180deg'}],
    },
    bottomRightValueCardFront: {
        position: 'absolute',
        bottom: 2,
        right: 6,
        fontSize: 14,
        transform: [{rotate: '180deg'}],
    },
    cardSmall: {
        width: 40,
        height: 60,
        borderRadius: 8,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
    },
    topLeftValueCardSmall: {
        position: 'absolute',
        top: 2,
        left: 4,
        fontSize: 10,
    },
    topLeftSuitCardSmall: {
        position: 'absolute',
        top: 14,
        left: 4,
        fontSize: 5,
    },
    centerCardSmall: {
        fontSize: 12,
        textAlign: 'center',
        textAlignVertical: 'center',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomRightSuitCardSmall: {
        position: 'absolute',
        bottom: 14,
        right: 4,
        fontSize: 5,
        transform: [{rotate: '180deg'}],
    },
    bottomRightValueCardSmall: {
        position: 'absolute',
        bottom: 2,
        right: 4,
        fontSize: 10,
        transform: [{rotate: '180deg'}],
    },
    cardBack: {
        width: 40,
        height: 60,
        backgroundColor: '#444',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#000',
    },
    cardBackBorder: {
        width: '98%',
        height: '98%',
        backgroundColor: '#ffffff',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardBackPattern: {
        width: '100%',
        height: '98%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#d1d1d1',
        borderRadius: 10,
        overflow: 'hidden',
    },
    discardZone: {
        marginTop: 50,
        width: 100,
        height: 100,
        backgroundColor: '#f0f0f0',
        borderColor: '#ccc',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    discardText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    discardCard: {
        marginTop: 5,
    },
    drawButton: {
        marginTop: 10,
    },
    animatedCard: {
        position: 'absolute',
        top: '40%',
        left: '50%',
        width: 80,
        height: 120,
        borderRadius: 8,
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 5,
        padding: 5,
        borderWidth: 1,
    },
    animatedCardBack: {
        position: 'absolute',
        width: 40,
        height: 60,
        borderRadius: 10,
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: 210,
        height: 95,
    },
    freeCardSpace: {
        width: 60,
        height: 95,
    },
});

export const mauOwnHandStyles = StyleSheet.create({
    ownHandContainer: {
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        bottom: 0,
        left: 40,
        right: 40,
        maxWidth: '80%',
    },
    cardContainer: {
        marginHorizontal: 0,
    },
});

export const mauPlayerHandStyles = StyleSheet.create({
    handContainer: {
        position: 'absolute',
    },
    playerName: {
        marginBottom: 5,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2fdda9',
        top: 40,
    },
    cardRowHorizontal: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardRowVertical: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        position: 'relative',
        alignItems: 'center',

    },
    playerContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',

    },
    profileImage: {
        position: 'absolute',
        top: 5,
        left: 5,
        width: 35,
        height: 35,
        borderRadius: Math.pow(2, 64) - 1,
    },
});

export const rulePageStyles = StyleSheet.create({
    topContainer: {
        position: 'absolute',
        top: 30,
        width: '100%',
        alignItems: 'center',
    },
    scrollList: {
        width: '100%',
        maxHeight: windowHeight - 110,
    },
});

export const collapsibleStyles = StyleSheet.create({
    container: {
        marginBottom: 10,
        borderWidth: 1,
        borderRadius: 8,
        overflow: 'hidden',
        width: '95%',
        alignSelf: 'center',

    },
    titleContainer: {
        padding: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    contentContainer: {
        overflow: 'hidden',

    },
    hiddenContent: {
        padding: 15,

    },
});

export const profile = StyleSheet.create({
    upperContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        marginTop: 50,
    },
    loadingText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    nameText: {
        fontSize: 30,
        marginVertical: 10,
    },
    noDataText: {
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 20,
    },
    signOutButton: {
        width: '75%',
        paddingVertical: 8,
        marginVertical: 8,
        alignSelf: 'center',
        position: 'absolute',
        bottom: 15,
    },
    changeButton: {
        width: '75%',
        paddingVertical: 8,
        marginVertical: 8,
        alignSelf: 'center',
    },
    editIconButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        borderRadius: 15,
    },
    modalContainer: {
        padding: 20,
        margin: 20,
        borderRadius: 10,
    },
    modalTitle: {
        alignSelf: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalButton: {
        marginTop: 10,
    },
    modalErrorText: {
        marginTop: 5,
    },
    pwdSnackbar: {
        flex: 1,
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
    },
    deleteButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        borderRadius: 10,
    },
});


export const codeFieldStyles = StyleSheet.create({
    codeFieldRoot: {
        marginVertical: 15,
    },
    cell: {
        marginHorizontal: 5,
        width: 43,
        height: 45,
        lineHeight: 38,
        fontSize: 28,
        borderWidth: 2,
        borderRadius: 7,
        textAlign: 'center',
    },
});


export const rankingStyles = StyleSheet.create({
    rankMessageContainer: {
        position: 'absolute',
        top: '40%',
        left: '10%',
        right: '10%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 15,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    rankMessageText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    placementTextContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 50,
    },
    placementText: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    leaderboardContainer: {
        position: 'absolute',
        top: '30%',
        left: '10%',
        right: '10%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 200,
    },
    leaderboardTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
    },
    leaderboardText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    leaderboardButton: {
        marginTop: 20,
        backgroundColor: 'white',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },

    leaderboardButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Halbtransparenter Hintergrund
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 300, // Höchste Ebene, damit nichts anderes anklickbar ist
        pointerEvents: 'auto', // Blockiert Klicks auf den Hintergrund
    },
});

export const timeoutPenaltyStyles = StyleSheet.create({
    dialogContainer: {
        borderRadius: 20,
    },
    title: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 22,
    },
    contentContainer: {
        alignItems: 'center',
    },
    messageText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
    },
    warningText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: custom.colors.gameRed,
    },
    actionsContainer: {
        justifyContent: 'center',
        paddingBottom: 10,
    },
});