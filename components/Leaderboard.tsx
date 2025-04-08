import React, {useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {fetchData} from '@/utilities/requests';
import {useSession} from '@/hooks/authContext';

interface LeaderboardProps {
    players: { id: string; rank: number }[];
    onPlayAgain: () => void;
    onExit: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({players, onPlayAgain, onExit}) => {
    const [playerNames, setPlayerNames] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(true);
    const {sessionToken, id} = useSession();
    const theme = useTheme();
    const rankColors = ['gold', 'silver', '#CD7F32', theme.colors.onBackground]; // Gold, Silber, Bronze, Schwarz

    const getUserByID = async (userID: string) => {
        try {
            const response = await fetchData(sessionToken, `/user/${userID}`);
            const userData = await response.json();
            return userData.username || `Spieler ${userID.substring(0, 5)}...`;
        } catch (error) {
            console.log('Fehler beim Abrufen des Benutzernamens:', error);
            return `Spieler ${userID.substring(0, 5)}...`;
        }
    };

    useEffect(() => {
        const fetchPlayerNames = async () => {
            setLoading(true);
            const newNames: { [key: string]: string } = {};

            try {
                await Promise.all(players.map(async (player) => {
                    newNames[player.id] = await getUserByID(player.id);
                }));
            } catch (error) {
                console.error('Fehler beim Abrufen der Spielernamen:', error);
            }

            setPlayerNames(newNames);
            setLoading(false);
        };

        if (players.length > 0) {
            fetchPlayerNames();
        }
    }, [players, sessionToken]);

    return (
        <View style={styles.overlay}>
            <View style={[styles.leaderboardContainer, {backgroundColor: theme.colors.background}]}>
                <Text style={styles.title}>🏆 Endergebnis 🏆</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#4CAF50"/>
                ) : (
                    <ScrollView style={styles.leaderboardList} showsVerticalScrollIndicator={false}>
                        {players.slice(0, 8).map((player, index) => {
                            const isUser = player.id === id; //Prüfen, ob es der eigene Spieler ist
                            return (
                                <View key={player.id}
                                      style={[
                                          styles.row,
                                          isUser && styles.yourRankRow, //Eigene ID bekommt eine grüne Umrandung
                                      ]}>
                                    <Text style={[
                                        styles.rankText,
                                        {color: rankColors[Math.min(player.rank - 1, 3)]},
                                    ]}>
                                        {player.rank}. {playerNames[player.id]} {/* Name anzeigen */}
                                    </Text>
                                </View>
                            );
                        })}
                    </ScrollView>
                )}

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.playAgainButton} onPress={onPlayAgain}>
                        <Text style={styles.buttonText}>Nochmal spielen</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.mainMenuButton} onPress={onExit}>
                        <Text style={styles.buttonText}>Hauptmenü</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default Leaderboard;

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    leaderboardContainer: {
        width: '90%',
        maxWidth: 450,
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    leaderboardList: {
        width: '100%',
        maxHeight: 350,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 12,
        paddingHorizontal: 6,
    },
    rankText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    yourRankRow: {
        borderWidth: 2,
        borderColor: 'green',
        borderRadius: 8,
        padding: 8,
        marginVertical: 2,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        width: '100%',
    },
    playAgainButton: {
        flex: 1,
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        borderRadius: 8,
        marginRight: 10,
        alignItems: 'center',
    },
    mainMenuButton: {
        flex: 1,
        backgroundColor: '#FF5722',
        paddingVertical: 12,
        borderRadius: 8,
        marginLeft: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
