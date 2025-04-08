import React, {useState} from 'react';
import {LayoutAnimation, Platform, TouchableOpacity, UIManager, View} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {collapsibleStyles} from '@/constants/Styles';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}


//@ts-ignore
const Collapsible = ({title, children}) => {
    const theme = useTheme();
    const [isExpanded, setIsExpanded] = useState(false);
    const [contentHeight, setContentHeight] = useState(0);

    const handleToggle = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    return (
        <View style={[collapsibleStyles.container, {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        }]}>
            <TouchableOpacity onPress={handleToggle} style={collapsibleStyles.titleContainer}>
                <Text style={[collapsibleStyles.title, {color: theme.colors.onPrimary}]}>{title}</Text>
            </TouchableOpacity>
            <View
                style={[
                    collapsibleStyles.contentContainer,
                    {height: isExpanded ? contentHeight : 0},
                ]}
            >
                <View
                    onLayout={() => {
                        const height = children.height;
                        setContentHeight(height);
                    }}
                    style={[collapsibleStyles.hiddenContent, {backgroundColor: theme.colors.background}]}
                >
                    {children}
                </View>
            </View>
        </View>
    );
};


export default Collapsible;
