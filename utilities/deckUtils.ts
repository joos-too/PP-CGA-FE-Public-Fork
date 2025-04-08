import 'react-native-get-random-values';
import {CardType} from '@/components/Card';

export const suits: string[] = ['♥', '♠', '♦', '♣'];
export const values: string[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};


export const sortHandSuitFirst = (cards: CardType[]): CardType[] => {
    return [...cards].sort((a, b) => {
        const suitComparison = suits.indexOf(a.suit) - suits.indexOf(b.suit);
        if (suitComparison !== 0) return suitComparison;
        return values.indexOf(a.value) - values.indexOf(b.value);
    });
};

export const sortHandValueFirst = (cards: CardType[]): CardType[] => {
    return [...cards].sort((a, b) => {
        const valueComparison = values.indexOf(a.value) - values.indexOf(b.value);
        if (valueComparison !== 0) return valueComparison;
        return suits.indexOf(a.suit) - suits.indexOf(b.suit);
    });
};

export const translateDeck = (backendDeck: { suit: string; value: string }[]): CardType[] => {
    const suitMap: Record<string, string> = {
        Hearts: '♥',
        Spades: '♠',
        Diamonds: '♦',
        Clubs: '♣',
    };

    return backendDeck.map(card => ({
        id: generateUUID(),
        suit: suitMap[card.suit] || card.suit,
        value: card.value,
    }));
};

export const translateCard = (card: { suit: string; value: string }): CardType => {
    const suitMap: Record<string, string> = {
        Hearts: '♥',
        Spades: '♠',
        Diamonds: '♦',
        Clubs: '♣',
    };

    return {
        id: generateUUID(),
        suit: suitMap[card.suit] || card.suit,
        value: card.value,
    };
};

export const reverseTranslateCard = (frontendCard: { suit: string; value: string }): {
    suit: string;
    value: string
} => {
    const reverseSuitMap: Record<string, string> = {
        '♥': 'Hearts',
        '♠': 'Spades',
        '♦': 'Diamonds',
        '♣': 'Clubs',
    };

    return {
        suit: reverseSuitMap[frontendCard.suit] || frontendCard.suit,
        value: frontendCard.value,
    };
};
