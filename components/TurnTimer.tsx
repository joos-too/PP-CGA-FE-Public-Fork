import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import {custom} from '@/constants/Colors';


const TurnTimer: React.FC<{ turnTimer: number }> = ({turnTimer}) => {
    return (
        <View style={{
            position: 'absolute',
            top: 40,
            right: 20,
            backgroundColor: turnTimer <= 10 ? custom.colors.gameRed : custom.colors.gameGreen,
            padding: 10,
            borderRadius: 20,
            width: 60,
            height: 60,
            zIndex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <Text style={{
                color: 'white',
                fontSize: 18,
                fontWeight: 'bold',
            }}>
                {turnTimer}
            </Text>
        </View>
    );
};

export default TurnTimer;
