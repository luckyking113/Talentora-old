// slash
// henry seng
// Sun May 21 2017

import React, { Component } from 'react'
import { StyleSheet, PixelRatio, Text, View } from 'react-native'
import IconMeterial from 'react-native-vector-icons/MaterialIcons';
import Iconicons from 'react-native-vector-icons/Ionicons';
import Styles from '@styles/tab.style'
import Utilities from '@styles/extends/ultilities.style';
import { Colors } from '@themes/index';

// const ICON_SIZE_ANDROID = __DEV__ ? 25 : PixelRatio.getPixelSizeForLayoutSize(25);
const ICON_SIZE_ANDROID = 24;

class TabItem extends Component {

    render() {
        const { tintColor, icon, iconType, label } = this.props
        // console.log('tab item props', this.props)
        /*if(iconType == 'M'){ 
            return <IconMeterial
                name={icon}
                style={[ styles.icon, { color: tintColor }]}
            />
        }
        else{
            return <Iconicons 
                name={icon}
                style={[ styles.icon, { color: tintColor }]}
            />
        }*/

        return  (<View style={[ styles.defaultContainer, styles.tabContainer, this.props.focused && styles.tabContainerSelected ]}>
                    <View style={[ styles.borderBot, this.props.focused && styles.borderBotSelected  ]}>
                        <Text style={[
                            styles.textStyle,
                            styles.paddingHorizontal,
                            styles.marginBotXXS,
                            this.props.focused && styles.tabSelected ,
                        ]}>
                        
                            { label }
                        
                        </Text>
                    </View>
                </View>)

        
    }
}

const styles = StyleSheet.create({ ...Styles, ...Utilities,
    tabContainer:{
        // borderBottomWidth: 1, 
        // borderBottomColor: Colors.lineColor, 
        justifyContent: 'flex-end'
    },
    tabContainerSelected:{
        // borderBottomWidth: 2, 
        // borderBottomColor: Colors.primaryColor, 
    },
    icon:{
        fontSize: ICON_SIZE_ANDROID
    },
    textStyle:{
        color: Colors.textBlack,
        fontWeight: 'bold',
        fontSize: 15,
    },
    borderBot: { 
        borderBottomWidth: 2, 
        borderBottomColor: 'transparent',  
    },
    borderBotSelected: { 
        borderBottomColor: Colors.primaryColor,  
    },
    tabSelected:{
        color: Colors.primaryColor,
    }

 });

export default TabItem
