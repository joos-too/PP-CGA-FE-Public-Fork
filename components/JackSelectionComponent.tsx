import React, {useState} from 'react';
import {Image, View} from 'react-native';
import {jackSelectionStyles} from '@/constants/Styles';


interface JackSelectionProps {
    options: {
        id: string;
        imageUrl: any;
    }[];
    scale?: number;
    onSelection: (suit: string) => void;
}

const JackSelection: React.FC<JackSelectionProps> = ({options, scale = 1, onSelection}) => {

    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    options[0].id = 'Hearts';
    options[1].id = 'Diamonds';
    options[2].id = 'Clubs';
    options[3].id = 'Spades';

    const handleSelect = (id: string) => {
        setSelectedOption(id);
        onSelection(id);
    };

    return (
        <View style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            width: 200 * scale,
            marginLeft: 40 * scale,
        }}>
            {options.map((option) => (
                <View
                    key={option.id}
                    style={{
                        ...jackSelectionStyles.jackSelection,
                        borderWidth: jackSelectionStyles.jackSelection.borderWidth * scale,
                        borderTopWidth: option.id === 'Hearts' || option.id === 'Diamonds' ? jackSelectionStyles.jackSelection.borderTopWidth * scale
                            : jackSelectionStyles.jackSelection.borderTopWidth * scale / 2,
                        borderBottomWidth: option.id === 'Hearts' || option.id === 'Diamonds' ? jackSelectionStyles.jackSelection.borderBottomWidth * scale / 2
                            : jackSelectionStyles.jackSelection.borderBottomWidth * scale,
                        borderRightWidth: option.id === 'Hearts' || option.id === 'Clubs' ? jackSelectionStyles.jackSelection.borderBottomWidth * scale / 2
                            : jackSelectionStyles.jackSelection.borderBottomWidth * scale,
                        borderLeftWidth: option.id === 'Diamonds' || option.id === 'Spades' ? jackSelectionStyles.jackSelection.borderBottomWidth * scale / 2
                            : jackSelectionStyles.jackSelection.borderBottomWidth * scale,
                        padding: jackSelectionStyles.jackSelection.padding * scale,
                        borderColor: selectedOption === option.id ? '#8f5ab5' : '#ccc',
                        backgroundColor: selectedOption === option.id ? '#f0f8ff' : '#fff',
                        borderTopLeftRadius: option.id === 'Hearts' ? 30 : 0,
                        borderTopRightRadius: option.id === 'Diamonds' ? 30 : 0,
                        borderBottomLeftRadius: option.id === 'Clubs' ? 30 : 0,
                        borderBottomRightRadius: option.id === 'Spades' ? 30 : 0,
                    }}
                    onTouchStart={() => handleSelect(option.id)}
                >
                    <Image
                        source={option.imageUrl}
                        style={{
                            ...jackSelectionStyles.jackSelectionImage,
                            width: jackSelectionStyles.jackSelectionImage.width * scale,
                            height: jackSelectionStyles.jackSelectionImage.height * scale,
                        }}
                    />
                </View>
            ))}
        </View>
    );
};

export default JackSelection;
