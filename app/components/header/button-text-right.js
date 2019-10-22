import React, { Component } from 'react'
import {
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native'

import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '@themes/index';
// const ICON_SIZE_ANDROID = __DEV__ ? 24 : PixelRatio.getPixelSizeForLayoutSize(24);
const ICON_SIZE_ANDROID = 24;

class ButtonTextRight extends Component {
 
    render() {

        const { icon, onPress, navigate, callBack, style, btnLabel } = this.props
        // console.log('callBack : ',callBack);
        return (<TouchableOpacity
            style={[{ marginRight: 15 }, style]}
            onPress={ () => {
                    // console.log('callBack _SELF', callBack);
                    callBack.handleFunc()
                }}
        >
            <Text style={[styles.txt]}>{btnLabel}</Text>
        </TouchableOpacity>)
    }
}

const styles = StyleSheet.create({ 
    icon: { 

        // width: 35,
        fontSize: ICON_SIZE_ANDROID,
        fontWeight: 'bold',
        color: Colors.tabBarActiveTintColor 
    },

    txt: {
        fontSize: 14,
        // fontWeight: 'bold',
        color: 'red'
    }

})

export default ButtonTextRight
