import React, {useEffect, useState} from 'react';
import {Image, Text, View, ViewStyle} from 'react-native';
import {CardBack} from '@/components/Card';
import {mauPlayerHandStyles} from '@/constants/Styles';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import {fetchAvatar} from '@/utilities/requests';
import {useSession} from '@/hooks/authContext';
import {Avatar, useTheme} from 'react-native-paper';

type PlayerProps = {
    name: string;
    initialImgUri: string;
    cardCount: number;
    position: 'left-bottom' | 'left-middle' | 'left-top' | 'top' | 'right-top' | 'right-middle' | 'right-bottom';
    playerId: string;
    sessionToken: string;
    isTurn?: boolean;
};

const positionStyles: Record<string, ViewStyle> = {
    'left-bottom': {
        position: 'absolute',
        bottom: -260,
        left: -160,
        flexDirection: 'column',
        alignItems: 'center',
    },
    'left-middle': {
        position: 'absolute',
        bottom: -80,
        left: -160,
        flexDirection: 'column',
        alignItems: 'center',
    },
    'left-top': {
        position: 'absolute',
        top: -160,
        left: -160,
        flexDirection: 'column',
        alignItems: 'center',
    },
    'top': {
        position: 'absolute',
        top: -200,
        left: -20,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    'right-top': {
        position: 'absolute',
        top: -160,
        right: -160,
        flexDirection: 'column',
        alignItems: 'center',
    },
    'right-middle': {
        position: 'absolute',
        bottom: -80,
        right: -160,
        flexDirection: 'column',
        alignItems: 'center',
    },
    'right-bottom': {
        position: 'absolute',
        bottom: -260,
        right: -160,
        flexDirection: 'column',
        alignItems: 'center',
    },
};

const Player: React.FC<PlayerProps> = ({name, initialImgUri, cardCount, position, playerId, isTurn=false}) => {
    const [profilePicture, setProfilePicture] = useState<String | null>(null);
    const {sessionToken} = useSession();
    const theme = useTheme();

    const isHorizontal = position === 'top';

    const containerStyle = positionStyles[position] || {};
    cardCount = Math.min(10, cardCount);

    const cardRotation =
        position === 'left-top' || position === 'left-middle' || position === 'left-bottom'
            ? '90deg'
            : position === 'right-top' || position === 'right-middle' || position === 'right-bottom'
                ? '-90deg'
                : '0deg';

    // Fetch profile picture from API based on playerId and sessionToken
    useEffect(() => {
        const fetchProfilePic = async () => {
            if (initialImgUri == '') {
                if (playerId && sessionToken) {
                    const avatar = await fetchAvatar(playerId, sessionToken); // Assume fetchAvatar is defined elsewhere
                    setProfilePicture(avatar); // Store the avatar in state
                }
            } else {
                setProfilePicture(initialImgUri);
            }
        };

        fetchProfilePic();
    }, [playerId, sessionToken]); // Re-run effect if playerId or sessionToken changes

    return (
        <View
            style={[
                mauPlayerHandStyles.handContainer,
                containerStyle,
                isHorizontal && {flexDirection: 'column', alignItems: 'center'},
            ]}
        >
            <View
                style={{
                    ...mauPlayerHandStyles.iconContainer,
                    top: position === 'top' ? 60 : 40,
                    left:
                        position === 'top'
                            ? -5
                            : position === 'left-top' || position === 'left-middle' || position === 'left-bottom'
                                ? 60
                                : -60,
                }}
            >
                {isTurn ?
                <AnimatedCircularProgress size={45} width={5} fill={100} tintColor="limegreen"/> :
                    <AnimatedCircularProgress size={45} width={5} fill={100} tintColor="lightgrey"/>}

                {profilePicture ? (
                    <Image
                        //@ts-ignore
                        source={{
                            uri: profilePicture,
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: sessionToken,
                            },
                        }}
                        style={mauPlayerHandStyles.profileImage}
                    />
                ) : (
                    <Avatar.Text
                        style={[mauPlayerHandStyles.profileImage, {backgroundColor: theme.colors.primary}]}
                        size={35}
                        label={name?.charAt(0).toUpperCase()}
                    />
                )}

                <View style={mauPlayerHandStyles.handContainer}>
                    <Text style={mauPlayerHandStyles.playerName}>{name}</Text>
                </View>
            </View>

            <View
                style={[
                    isHorizontal ? mauPlayerHandStyles.cardRowHorizontal : mauPlayerHandStyles.cardRowVertical,
                    mauPlayerHandStyles.handContainer,
                ]}
            >
                {Array(cardCount)
                    .fill(null)
                    .map((_, index) => (
                        <CardBack
                            key={index}
                            style={{
                                width: 40,
                                height: 60,
                                marginLeft: isHorizontal && index > 0 ? -50 : 0,
                                marginTop: !isHorizontal && index > 0 ? -50 : 0,
                                transform: [{rotate: cardRotation}],
                            }}
                        />
                    ))}
            </View>
        </View>
    );
};

export default Player;
