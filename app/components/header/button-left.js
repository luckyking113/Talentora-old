import React, { Component } from 'react'
import {
    StyleSheet,
    TouchableOpacity,
    PixelRatio
} from 'react-native'

import Icon from 'react-native-vector-icons/MaterialIcons';
import { IconCustom } from '@components/ui/icon-custom';

import { Colors } from '@themes/index';
// const ICON_SIZE_ANDROID = __DEV__ ? 24 : PixelRatio.getPixelSizeForLayoutSize(24);
const ICON_SIZE_ANDROID = 24;
class ButtonLeft extends Component {

    render() {

        const { icon, onPress, navigate, to } = this.props

        return (<TouchableOpacity
            style={{ marginLeft: 15 }}
            onPress={ () => navigate(to) }
        >
            <IconCustom
                name={icon}
                style={[ styles.icon ]}
            />
        </TouchableOpacity>)
    }
}

const styles = StyleSheet.create({
    icon: { 
        // width: 50,
        fontSize: ICON_SIZE_ANDROID,
        color: Colors.tabBarActiveTintColor  
    }
})

export default ButtonLeft
