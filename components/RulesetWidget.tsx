import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, useColorScheme, View} from 'react-native';
import {SegmentedButtons} from 'react-native-paper';
import {customDarkTheme, customLightTheme} from '@/constants/Colors';

interface RulesetWidgetProps {
    options: {
        id: number;
        label?: string;
        imageUrl: any;
    }[];
    scale?: number;
    force?: number;
    onSelect?: (selectedId: number) => void;
}

const RulesetWidget: React.FC<RulesetWidgetProps> = ({options, scale = 1, force = 3, onSelect}) => {
    const [selectedOption, setSelectedOption] = useState<number>(1);
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? customDarkTheme : customLightTheme;

    useEffect(() => {
        if (force !== 3) {
            setSelectedOption(force);
            if (onSelect) {
                onSelect(force);
            }
        }
    }, []);

    options[0].id = 1;
    options[1].id = 2;

    const handleSelect = (id: number) => {
        let newSelection = id;
        if (force === 1) newSelection = 1;
        else if (force === 2) newSelection = 2;

        setSelectedOption(newSelection);
        if (onSelect) {
            onSelect(newSelection);
        }
    };

    return (
        <View style={styles.container}>
            <SegmentedButtons
                value={selectedOption?.toString() || ''}
                onValueChange={(value) => handleSelect(Number(value))}
                buttons={options.map(option => ({
                    label: option.label || '',
                    value: option.id.toString(),
                    icon: () => (
                        <Image source={option.imageUrl}
                               style={[styles.image, {width: 50 * scale, height: 50 * scale}]}/>
                    ),
                    style: [
                        styles.button,
                        {
                            borderColor: selectedOption === option.id ? theme.colors.primary : theme.colors.gameCodeButton,
                            backgroundColor: 'transparent',
                            borderRightWidth: option.id === 1 ? 1.5 : 3,
                            borderLeftWidth: option.id === 2 ? 1.5 : 3,
                        },
                    ],
                    labelStyle: {
                        color: theme.colors.onBackground,
                    },
                }))}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '95%',
    },
    image: {
        marginRight: 5,
    },
    button: {
        width: 75,
        height: 75,
        borderWidth: 3,
        marginVertical: 25,
    },
});

export default RulesetWidget;
