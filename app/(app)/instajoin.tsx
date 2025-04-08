import {landingpage} from '@/constants/Styles';
import {Text} from 'react-native-paper';
import React, {useEffect, useState} from 'react';
import {CenteredView} from '@/components/ThemedComponents';
import * as Linking from 'expo-linking';
import {fetchData} from '@/utilities/requests';
import {GameResponse} from '@/constants/Interfaces';
import {router} from 'expo-router';
import {useSession} from '@/hooks/authContext';

export default function instajoin() {

    const {sessionToken, username, id, isGuest} = useSession();
    const [gameCode, setGameCode] = useState('');


    const fetchGameId = async (gameCode: string | null) => {
        try {
            const response = await fetchData(sessionToken, '/game/' + gameCode?.toLowerCase().trim());
            const data: GameResponse = await response.json();
            console.log(data);
            router.replace({pathname: '/', params: {instajoinGame: JSON.stringify(data)}});
        } catch (error) {
            console.log('error: ' + error);
            router.replace('/');
        }

    };

    const debugJoinRoom = (code: string) => {
        if (code != null) {
            setGameCode(code);
            fetchGameId(code);
        }

    };

    useEffect(() => {
        const url = Linking.getLinkingURL();
        console.log('true URL: ' + url);
        let queryParams = url != null ? Linking.parse(url).queryParams : undefined;
        console.log('qp changed: ' + queryParams?.code);
        debugJoinRoom(queryParams?.code as string);
    }, []);


    return (
        <CenteredView
            style={landingpage.homeView}
        >

            <Text
                variant={'headlineMedium'}
                style={landingpage.welcomeText}
            >
                Direktbeitritt zum Spiel {gameCode}
            </Text>
        </CenteredView>
    );
}