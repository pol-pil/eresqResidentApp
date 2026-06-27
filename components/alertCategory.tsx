import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { styles } from '@/styles/home.styles'

export default function AlertCategory({ iconName, iconColor } : { iconName:any, iconColor:any }) {
    return (
        <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
            <Ionicons style={[styles.icon, { fontSize: styles.iconContainer.width * 0.5 }]} name={iconName}/>
        </View>
    );
  }
