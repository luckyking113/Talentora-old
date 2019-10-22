import React, { Component } from 'react'
import {
    StyleSheet,
    TouchableOpacity,
    PixelRatio,
    Text,
    View,
    DeviceEventEmitter
} from 'react-native'

import Icon from 'react-native-vector-icons/MaterialIcons';
import IconAwesome from 'react-native-vector-icons/FontAwesome';
import { IconCustom } from '@components/ui/icon-custom';
import { Colors } from '@themes/index';
import { Helper, ChatHelper } from '@helper/helper';
// import SendBird from 'sendbird';
import _ from 'lodash';
// const sb = null;

// const ICON_SIZE_ANDROID = __DEV__ ? 24 : PixelRatio.getPixelSizeForLayoutSize(24);
const ICON_SIZE_ANDROID = 22;

class ButtonRight extends Component {

    _goToScreen = () => {
        const { icon, onPress, navigate, to, style , btnLabel, nav, chat_info, navigation, isFilter, filterType} = this.props;
        if(!this.props.isReview){
            if(isFilter){
                // console.log("Filter: ", this.props.navigation);
                if(filterType == 'discover'){
                    navigate(to, {'filterType': filterType, 'tabType': this.props.navigation.state.params.tabType});                               
                }
                else{
                    navigate(to, {'filterType': filterType});               
                }
            }
            else{
                let JobInfo;
                if(nav)
                    JobInfo = nav.state.params.job;
                navigate(to, {'Job_Info': JobInfo});   
            }


        }else{
            navigate(to, { 'user':this.props.user })
        }
    }

    render() {
        const { icon, onPress, navigate, to, style , btnLabel, nav, chat_info, navigation} = this.props
        // console.log("btn right navigation: ", navigation)

        let isChat = false;
        if(chat_info){
            // For Direct Message
            // sb = SendBird.getInstance();
            isChat = true;
        }

        // For Edit Job Posted
        return (
            <View style={{ flex: 1, flexDirection: 'row'}}>
                <TouchableOpacity
                    style={[{ marginRight: 15 , flex: 1, flexDirection: 'row', alignItems: 'center'}, style]}
                    onPress={ () => isChat ? this.directToMessage() : this._goToScreen() }>
                    { icon ? <IconCustom
                        name={icon}
                        style={[ styles.icon ]}
                    /> : null }
                    
                    <Text style={[styles.btnLabel]}>{btnLabel}</Text> 
            </TouchableOpacity>
            {/* {icon == 'message-icon' &&
                <TouchableOpacity
                    style={[{ marginRight: 15 , flex: 1, flexDirection: 'row', alignItems: 'center'}, style]}
                    onPress={ () => this.directToSpam() }>
                        <IconAwesome name={'flag-o'}
                            style={[ styles.icon, { marginLeft: 5 } ]} />
                </TouchableOpacity>
            } */}
        </View>
        )
    }

    directToMessage = () => {
        // Alert.alert('Bring me to message page'); 
        // console.log('USER INFORMATION FOR CHAT : ', this.props); 
        // return;

        const { chat_info} = this.props;
        
        // console.log("chat_info: ", chat_info)

        let userObj = {
            id : chat_info.user._id || chat_info.user,
            cover : Helper._getCover(chat_info), 
            full_name :  Helper._getUserFullName(chat_info.attributes), 
        }
        let _SELF = this;

        
        const { navigate, goBack, state } = _SELF.props.navigation;
        let _paramObj = {
            message_data: {
                name: userObj.full_name,
                // channelUrl: _channel.url,
                chat_id: userObj.id,
            },
            // direct_chat: true,
            // user_info: userProfile,
            userObj: userObj,
        };
        navigate('Message',_paramObj); 
    }

    directToSpam = () => {
        DeviceEventEmitter.emit('SpamReport');
    }

}

const styles = StyleSheet.create({
    icon: { 
        // width: 30,
        fontSize: ICON_SIZE_ANDROID,
        color: Colors.tabBarActiveTintColor 
    }

})

export default ButtonRight
