import React from 'react';
import {Image, StyleSheet, useColorScheme} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import Animated, {useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated';
import {PanGestureHandler, TapGestureHandler} from 'react-native-gesture-handler';
import {cardStyles} from '@/constants/Styles';

export type CardType = {
    id: string;
    suit: string;
    value: string;
};

type CardProps = CardType & {
    index: number;
    selectedCards?: number[];
    setSelectedCard?: (index: number) => void;
    needsSelection?: boolean;
    isDisabled?: boolean;
    onDrop: (index: number) => void;
    isDropped: boolean;
};

export const Card: React.FC<CardProps> = ({
                                              suit,
                                              value,
                                              index,
                                              selectedCards,
                                              setSelectedCard,
                                              onDrop,
                                              isDropped,
                                              needsSelection,
                                              isDisabled,
                                          }) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const theme = useTheme();

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {translateX: translateX.value},
                {translateY: translateY.value},
            ],
            // @ts-ignore
            borderColor: isDropped || !selectedCards ? theme.colors.gameCodeButton : selectedCards.includes(index) ? 'green' : theme.colors.gameCodeButton,
            borderWidth: isDropped || !selectedCards ? 1 : selectedCards.includes(index) ? 3 : 1,
            backgroundColor: theme.colors.background,
        };
    });

    const onGestureEvent = ({nativeEvent}: any) => {
        if (isDisabled) return;

        translateX.value = nativeEvent.translationX;
        translateY.value = nativeEvent.translationY;
    };

    const onEndGesture = ({nativeEvent}: any) => {
        if (isDisabled) return;

        const withinDropZone =
            nativeEvent.absoluteX > 50 &&
            nativeEvent.absoluteX < 350 &&
            nativeEvent.absoluteY > 100 &&
            nativeEvent.absoluteY < 600;

        // Unselected cards in lügen are sprung back
        if (needsSelection && selectedCards && !selectedCards.includes(index)) {
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
            return;
        }

        if (withinDropZone) {
            onDrop(index);
        } else {
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
        }
    };

    const onTapGesture = () => {
        if (isDisabled) return;
        if (!isDropped) if (setSelectedCard) {
            setSelectedCard(index);
        }
    };

    return (
        <TapGestureHandler onEnded={onTapGesture}>
            <PanGestureHandler onGestureEvent={onGestureEvent} onEnded={onEndGesture}>
                <Animated.View style={[cardStyles.card, animatedStyle]}>
                    <Text style={[cardStyles.topLeftValue, {color: theme.colors.onBackground}]}>{value}</Text>
                    <Text style={cardStyles.topLeftSuit}>{suit}</Text>
                    <Text style={cardStyles.center}>{suit}</Text>
                    <Text style={cardStyles.bottomRightSuit}>{suit}</Text>
                    <Text style={[cardStyles.bottomRightValue, {color: theme.colors.onBackground}]}>{value}</Text>
                </Animated.View>
            </PanGestureHandler>
        </TapGestureHandler>
    );
};

export const CardBack: React.FC<{ onPress?: () => void; style?: any }> = ({onPress, style}) => {
    const colorScheme = useColorScheme();
    const imageSource = colorScheme === 'dark'
        ? require('@/assets/images/back-darkmode.png')
        : require('@/assets/images/back-lightmode.png');

    return (
        <TapGestureHandler onEnded={onPress}>
            <Animated.View style={[cardStyles.cardBack, style]}>
                <Image
                    source={imageSource}
                    style={styles.imageBack}
                />
            </Animated.View>
        </TapGestureHandler>
    );
};

export const CardFront: React.FC<{ suit: string; value: string; style?: any }> = ({suit, value, style}) => {
    const theme = useTheme();
    return (
        <Animated.View style={[cardStyles.cardFront, {
            backgroundColor: theme.colors.background,
            // @ts-ignore
            borderColor: theme.colors.gameCodeButton,
        }, style]}>
            <Text
                style={[cardStyles.topLeftValueCardFront, {color: theme.colors.onBackground}]}>{value}</Text>
            <Text style={cardStyles.topLeftSuitCardFront}>{suit}</Text>
            <Text style={cardStyles.centerCardFront}>{suit}</Text>
            <Text style={cardStyles.bottomRightSuitCardFront}>{suit}</Text>
            <Text
                style={[cardStyles.bottomRightValueCardFront, {color: theme.colors.onBackground}]}>{value}</Text>
        </Animated.View>
    );
};

export const CardSmall: React.FC<{ suit: string; value: string; style?: any }> = ({suit, value, style}) => {
    const theme = useTheme();
    return (
        <Animated.View style={[cardStyles.cardSmall, {
            backgroundColor: theme.colors.background,
            // @ts-ignore
            borderColor: theme.colors.gameCodeButton,
        }, style]}>
            <Text
                style={[cardStyles.topLeftValueCardSmall, {color: theme.colors.onBackground}]}>{value}</Text>
            <Text style={cardStyles.topLeftSuitCardSmall}>{suit}</Text>
            <Text style={cardStyles.centerCardSmall}>{suit}</Text>
            <Text style={cardStyles.bottomRightSuitCardSmall}>{suit}</Text>
            <Text
                style={[cardStyles.bottomRightValueCardSmall, {color: theme.colors.onBackground}]}>{value}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    imageBack: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
});
