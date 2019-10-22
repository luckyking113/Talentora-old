import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, PixelRatio, View } from 'react-native';
import IconMeterial from 'react-native-vector-icons/MaterialIcons';
import Iconicons from 'react-native-vector-icons/Ionicons';
import Styles from '../../styles/tab.style'
import { Colors } from '@themes/index';

import { IconCustom } from '@components/ui/icon-custom';

import * as BadgeNotification from '@actions/notification';


// const ICON_SIZE_ANDROID = __DEV__ ? 25 : PixelRatio.getPixelSizeForLayoutSize(25);
const ICON_SIZE_ANDROID = 22;


const mapStateToProps = (state) => {
    // console.log('main state',state);
    return {
        notification: state.notification,
    }
}

class Tab extends Component {

    render() {

        const { tintColor, icon, iconType, navigation, badgeNumber, notiType } = this.props
        // console.log('icon : ', icon, ' == ', 'badgeNumber: ', badgeNumber);
        // badgeNumber = 2;

        // console.log('My ----- PROPS: ', this.props);
        let badgeNum = 0;

        if(this.props.notification){
            if(this.props.notification[notiType]){
                badgeNum = this.props.notification[notiType];
            }
        }

        // let badgeNum = typeof this.props.notification === 'undefined' ? 0 : 0;

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
                    { badgeNum>0 && <View style={[ styles.dot ]}/> }
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

export default connect(mapStateToProps, BadgeNotification)(Tab);

// export default Tab
