import React, { Component } from 'react'
import { StyleSheet, PixelRatio, View } from 'react-native'
import IconMeterial from 'react-native-vector-icons/MaterialIcons';
import Iconicons from 'react-native-vector-icons/Ionicons';
import Styles from '../../styles/tab.style'

import { IconCustom } from '@components/ui/icon-custom';

// const ICON_SIZE_ANDROID = __DEV__ ? 25 : PixelRatio.getPixelSizeForLayoutSize(25);
const ICON_SIZE_ANDROID = 22;

class Tab extends Component {

    render() {

        // const { tintColor, icon, iconType } = this.props
        const { tintColor, icon, iconType, navigation, badgeNumber } = this.props
        // badgeNumber = 122;
        // console.log('iconType: ', iconType);
        if(iconType == 'M'){
            return <IconMeterial
                name={icon}
                style={[ styles.icon, { color: tintColor }]}
            />
        }
        else if(iconType=="C"){ // custom icon
            return (  
                <View>
                    <IconCustom  
                        name={icon}
                        style={[ styles.icon, { color: tintColor }]}
                    />
                    { badgeNumber>0 && <View style={[ styles.dot ]}/> }
                </View>
            )

        }
        else{
            return <Iconicons
                name={icon}
                style={[ styles.icon, { color: tintColor }]}
            />
        }
        
    }
}

const styles = StyleSheet.create({ ...Styles,

    icon:{
        fontSize: ICON_SIZE_ANDROID
    },
    dot:{
        width: 5,
        height: 5,
        backgroundColor: Colors.primaryColor,
        position: 'absolute',
        borderRadius: 2.5,
        bottom: -8,
        left: 8,

    }

 });

export default Tab
