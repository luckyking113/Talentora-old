import React, { Component } from 'react'
import {
    StyleSheet,
    Text,
    View,
    TouchableHighlight,
    TouchableOpacity,
    DeviceEventEmitter
} from 'react-native'
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import Icon from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/Entypo';
import { Colors } from '@themes/index';
import { IconCustom } from '@components/ui/icon-custom';
import { UserHelper, Helper } from '@helper/helper';

import { NavigationActions } from 'react-navigation';
import _ from 'lodash'

class ButtonBack extends Component {

    // _updateMetaDataMessage = () => {
    //     const { icon, isGoBack, btnLabel, colBtn, screen  } = this.props;
    //     const {state} = isGoBack;
        
    //     let _members = _.cloneDeep(state.params.message_members);

    //     _members[UserHelper.UserInfo._id].isOnScreen = false;
        
    //     console.log('update my meta data: ',_members);

    //     state.params.message_channel.updateMetaData({ chat_members : JSON.stringify(_members)}, function(response, error){
    //         if (error) {
    //             console.log(error);
    //             return;
    //         }
    //         console.log('success update meta data: ', JSON.parse(response.chat_members));					
    //     });

    // }

    _handleClick = () => {

        const { icon, isGoBack, btnLabel, colBtn, screen  } = this.props;

        console.log('state : ', isGoBack.state);

        const {state} = isGoBack;
        // state.params._callBack();

        // console.log('state param: ', state.params);
        // if(screen == 'message_detail'){
        //     if(state.params.message_channel){
        //         this._updateMetaDataMessage();
        //         state.params.message_channel.markAsRead();
        //     }
        // }

        if(state.params){
            if(state.params.updateUserVideoList){
                DeviceEventEmitter.emit('updateProfileInfo',  {update_video: true})
            }
        }

        if(state.params){
            if(state.params.backToJobList){

                const resetAction = NavigationActions.reset({ index: 0, actions: [{type: NavigationActions.NAVIGATE, routeName: 'RootScreen'}], key: null })
                isGoBack.dispatch(resetAction);

                // isGoBack.dispatch({
                //         type: 'Navigation/RESET',
                //         index: 0,
                //         actions: [
                //         // { type: 'Navigate', routeName: 'Waiting', params: { payload } },
                //         { type:  NavigationActions.NAVIGATE, routeName: 'JobList' }
                //         ]
                //     })
                // isGoBack.goBack('RootScreen');

            }
            else if(state.params.resetScreen){
                const resetAction = NavigationActions.reset({ index: state.params.routeIndex, actions: [{type: NavigationActions.NAVIGATE, routeName: state.params.resetScreen}], key: state.params.routeKey })
                isGoBack.dispatch(resetAction);
            }
            else{
                isGoBack.goBack();
            }
        }
        else{
            // isGoBack.dispatch(NavigationActions.back());
            isGoBack.goBack();
        }



        

    }

    render() { 

        const { icon, isGoBack, btnLabel, colBtn } = this.props
        // console.log(colBtn);
        // if(!colBtn)
        //     colBtn = {};

        return (<TouchableOpacity
            style={[styles.btnContainer, _.isEmpty(btnLabel) && styles.noTextLabel]}
            onPress={ () => this._handleClick() }

        >
            {/*<Icon
                name1="ios-arrow-back"
                name="chevron-small-left"
                style={[ styles.icon, colBtn ]}
            />*/}
            <IconCustom
                name="back-gray-icon"
                style={[ styles.icon, colBtn ]}
            />
            <Text style={[styles.btnLabel, colBtn]}>{btnLabel}</Text> 

        </TouchableOpacity>)
    }
}

const styles = StyleSheet.create({
    btnContainer:{
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 50,
        // backgroundColor: 'red',
    },
    noTextLabel: {
        paddingRight: 20,
    },
    btnLabel:{
        marginLeft: 15,
        fontSize: 17,
        // fontWeight: 'bold',
        color: Colors.textColorDark,
    },
    icon: { 
        left: 5,
        fontSize: 18,
        color: Colors.placeHolder, 
    }
})

export default ButtonBack
