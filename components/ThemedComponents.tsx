import React from 'react';
import {View, ViewStyle} from 'react-native';
import {styles} from '@/constants/Styles';
import {useTheme} from 'react-native-paper';

interface ViewProps {
    style?: ViewStyle;
    children: React.ReactNode;
}

export const CenteredView: React.FC<ViewProps> = ({style, children}) => {
    const theme = useTheme();
    return (
        <View style={[styles.centered_container, {backgroundColor: theme.colors.background}, style]}>
            {children}
        </View>
    );
};

export const ThemedView: React.FC<ViewProps> = ({style, children}) => {
    const theme = useTheme();
    return (
        <View style={[styles.container, {backgroundColor: theme.colors.background}, style]}>
            {children}
        </View>
    );
};
