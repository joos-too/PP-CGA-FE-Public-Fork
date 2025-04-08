import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Icon, Text} from 'react-native-paper';

interface PlayerCardProps {
    PlayerName: string;
    PlayerReady: boolean;
}
const LobbyPlayerComponent = (props: PlayerCardProps) => {
    return (
        <View style={styles.rowContainer}>
            <Text style={styles.playerName} numberOfLines={1} ellipsizeMode='tail'>
                {props.PlayerName != '' ? props.PlayerName : 'Leerer Slot'}
            </Text>

            <View style={styles.iconViewStyle}>
                <Icon size={32}
                      source={props.PlayerName == '' ? 'block-helper' : props.PlayerReady ? 'check-bold' : 'timer-sand'}></Icon>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    rowContainer: {
        flexDirection: 'row',
        paddingHorizontal: 6,
        justifyContent: 'space-between', // Statt center
        alignItems: 'center', // Vertikal zentrieren
    },
    playerName: {
        textAlignVertical: 'center',
        flex: 1, // Flex für Text, damit er den verfügbaren Platz einnimmt
    },
    iconViewStyle: {
        alignItems: 'flex-end',
    },
});

export default LobbyPlayerComponent;


