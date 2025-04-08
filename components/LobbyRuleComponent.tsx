import React from 'react';
import {IconButton, useTheme} from 'react-native-paper';
import {Text, Tooltip} from '@rneui/base';
import {useColorScheme, View} from 'react-native';

//@ts-ignore
const RuleTooltip = ({rule, isOpen, onOpen, onClose}) => {
    const theme = useTheme();
    const colorScheme = useColorScheme();

    return (
        <View>
            <Tooltip
                popover={<Text style={{color: theme.colors.onBackground}}>{rule.name}</Text>}
                visible={isOpen}
                onOpen={onOpen}
                onClose={onClose}
                containerStyle={{width: 200, height: 75}}
                // @ts-ignore
                backgroundColor={colorScheme === 'dark' ? '#5e5e5e' : '#d5d5d5'}

            >
            </Tooltip>
            <IconButton icon={rule.imgName} size={24} onPress={onOpen}/>
        </View>
    );
};

export default RuleTooltip;
