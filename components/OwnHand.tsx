import React from 'react';
import {View} from 'react-native';
import {Card, CardType} from '@/components/Card';
import {mauOwnHandStyles} from '@/constants/Styles';

type OwnHandProps = {
    hand: CardType[];
    selectedCards?: number[];
    setSelectedCard?: (index: number) => void;
    needsSelection?: boolean;
    disabled?: boolean;
    onDrop: (index: number) => void;
};

const OwnHand: React.FC<OwnHandProps> = ({hand, selectedCards, setSelectedCard, onDrop, disabled}) => {
    const defaultSpacing = -40;
    const maxSpacing = -20;
    const minSpacing = -65;

    const cardSpacing = Math.max(
        minSpacing,
        Math.min(maxSpacing, defaultSpacing + (7 - hand.length) * 3.5),
    );

    const defaultScale = 1;
    const minScale = 0.6;
    const cardScale = hand.length > 14
        ? Math.max(minScale, defaultScale - (hand.length - 14) * 0.04)
        : defaultScale;

    return (
        <>
            {hand.map((card, index) => (
                <View
                    key={card.id}
                    style={{
                        ...mauOwnHandStyles.cardContainer,
                        marginLeft: index > 0 ? cardSpacing : 0,
                        transform: [{scale: cardScale}],
                    }}
                >
                    <Card
                        suit={card.suit}
                        value={card.value}
                        id={card.id}
                        index={index}
                        selectedCards={selectedCards}
                        setSelectedCard={setSelectedCard}
                        onDrop={onDrop}
                        isDropped={false}
                        isDisabled={disabled}
                        needsSelection={true}
                    />
                </View>
            ))}
        </>
    );
};

export default OwnHand;
